from __future__ import annotations

import argparse
import importlib
import json
import sys
from datetime import datetime
from email.parser import BytesParser
from email.policy import default
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


APP_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = APP_DIR / "scripts"
MAX_UPLOAD_BYTES = 50 * 1024 * 1024

sys.path.insert(0, str(SCRIPTS_DIR))
import build_dashboard_data as data_builder  # noqa: E402


class UploadRequestError(Exception):
    def __init__(self, public_message: str, status_code: int = 400, details: list[str] | None = None) -> None:
        super().__init__(public_message)
        self.public_message = public_message
        self.status_code = status_code
        self.details = details or []


def get_data_builder():
    global data_builder
    data_builder = importlib.reload(data_builder)
    return data_builder


class DashboardHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def do_GET(self) -> None:
        route = urlparse(self.path).path
        if route == "/api/dashboard-data":
            self.handle_dashboard_data()
            return
        super().do_GET()

    def do_POST(self) -> None:
        route = urlparse(self.path).path
        if route == "/api/upload-data":
            self.handle_upload_data()
            return
        self.send_json(404, {"ok": False, "message": "Endpoint not found."})

    def handle_dashboard_data(self) -> None:
        builder = get_data_builder()
        try:
            payload = builder.ensure_dashboard_payload()
            self.send_json(200, payload)
        except builder.DataValidationError as error:
            self.send_json(
                400,
                {
                    "ok": False,
                    "message": error.public_message,
                    "details": error.details,
                },
            )
        except Exception:
            self.send_json(
                500,
                {
                    "ok": False,
                    "message": "Dashboard data is unavailable right now. Please restart the local dashboard server.",
                },
            )

    def handle_upload_data(self) -> None:
        builder = get_data_builder()
        temp_path: Path | None = None
        try:
            original_name, file_bytes, mode = self.read_uploaded_file()
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
            temp_path = builder.UPLOADS_DIR / f"_incoming_upload_{timestamp}{Path(original_name).suffix.lower()}"
            temp_path.parent.mkdir(parents=True, exist_ok=True)
            temp_path.write_bytes(file_bytes)

            payload = builder.activate_uploaded_dataset(temp_path, original_name, mode=mode)
            self.send_json(
                200,
                {
                    "ok": True,
                    "message": "Data uploaded and dashboard updated successfully.",
                    "payload": payload,
                },
            )
        except UploadRequestError as error:
            if temp_path and temp_path.exists():
                temp_path.unlink()
            self.send_json(
                error.status_code,
                {
                    "ok": False,
                    "message": error.public_message,
                    "details": error.details,
                },
            )
        except builder.DataValidationError as error:
            if temp_path and temp_path.exists():
                temp_path.unlink()
            self.send_json(
                400,
                {
                    "ok": False,
                    "message": error.public_message,
                    "details": error.details,
                },
            )
        except Exception:
            if temp_path and temp_path.exists():
                temp_path.unlink()
            self.send_json(
                500,
                {
                    "ok": False,
                    "message": "The selected file could not be processed. Please upload a valid .xlsx or .csv dataset.",
                },
            )

    def read_uploaded_file(self) -> tuple[str, bytes, str]:
        builder = get_data_builder()
        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type:
            raise UploadRequestError(
                "Uploaded file format is invalid. Please upload a file matching the required dataset structure."
            )

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise UploadRequestError("The uploaded file could not be read. Please try again.") from error

        if content_length <= 0:
            raise UploadRequestError(
                "Uploaded file format is invalid. Please upload a file matching the required dataset structure.",
                details=["The uploaded file is empty."],
            )
        if content_length > MAX_UPLOAD_BYTES:
            raise UploadRequestError(
                "Uploaded file format is invalid. Please upload a file matching the required dataset structure.",
                details=["The uploaded file is too large. Please use a file smaller than 50 MB."],
            )

        body = self.rfile.read(content_length)
        message = BytesParser(policy=default).parsebytes(
            f"Content-Type: {content_type}\r\nMIME-Version: 1.0\r\n\r\n".encode("utf-8") + body
        )

        if not message.is_multipart():
            raise UploadRequestError(
                "Uploaded file format is invalid. Please upload a file matching the required dataset structure."
            )

        selected_mode = "general"
        dataset_name = ""
        dataset_bytes = b""

        for part in message.iter_parts():
            if part.get_content_disposition() != "form-data":
                continue
            field_name = part.get_param("name", header="content-disposition")
            if field_name == "mode":
                selected_mode = (part.get_content() or "general").strip().lower()
                continue
            if field_name != "dataset":
                continue

            filename = Path(part.get_filename() or "").name
            file_bytes = part.get_payload(decode=True) or b""
            if not filename:
                raise UploadRequestError(
                    "Uploaded file format is invalid. Please upload a file matching the required dataset structure.",
                    details=["Please choose a dataset file before uploading."],
                )
            if Path(filename).suffix.lower() not in builder.SUPPORTED_EXTENSIONS:
                raise UploadRequestError(
                    "Uploaded file format is invalid. Please upload a file matching the required dataset structure.",
                    details=[f"Supported file types: {', '.join(sorted(builder.SUPPORTED_EXTENSIONS))}."],
                )
            if not file_bytes:
                raise UploadRequestError(
                    "Uploaded file format is invalid. Please upload a file matching the required dataset structure.",
                    details=["The uploaded file is empty."],
                )
            dataset_name = filename
            dataset_bytes = file_bytes

        if selected_mode not in {"general", "complaint"}:
            selected_mode = "general"

        if dataset_name and dataset_bytes:
            return dataset_name, dataset_bytes, selected_mode

        raise UploadRequestError(
            "Uploaded file format is invalid. Please upload a file matching the required dataset structure.",
            details=["No dataset file was received."],
        )

    def send_json(self, status_code: int, payload: dict) -> None:
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(encoded)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the call center dashboard with upload support.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()

    builder = get_data_builder()
    builder.ensure_dashboard_payload()

    with ThreadingHTTPServer((args.host, args.port), DashboardHandler) as server:
        print(f"Dashboard server running at http://{args.host}:{args.port}")
        server.serve_forever()


if __name__ == "__main__":
    main()
