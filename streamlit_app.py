from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


APP_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = APP_DIR / "scripts"
DATA_DIR = APP_DIR / "data"

if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

import build_dashboard_data as data_builder  # noqa: E402


DASHBOARD_HEIGHT = 6800


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


@st.cache_data(show_spinner=False)
def load_dashboard_assets() -> tuple[str, str]:
    return read_text(APP_DIR / "styles.css"), read_text(APP_DIR / "app.js")


@st.cache_data(show_spinner=False)
def load_fallback_payload() -> dict | None:
    payload_path = DATA_DIR / "call-center-dashboard.json"
    if not payload_path.exists():
        return None
    return json.loads(payload_path.read_text(encoding="utf-8"))


def load_dashboard_payload() -> tuple[dict | None, str | None]:
    try:
        return data_builder.ensure_dashboard_payload(), None
    except Exception:
        fallback = load_fallback_payload()
        if fallback is not None:
            return fallback, "Loaded the last generated dashboard bundle because live dataset resolution was unavailable."
        return None, "No sample dataset is bundled in this deployment. Upload a General or Complaint dataset to initialize the dashboard."


def apply_uploaded_dataset(uploaded_file, mode: str) -> dict:
    suffix = Path(uploaded_file.name).suffix.lower()
    if suffix not in data_builder.SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file type for {mode} mode. Use one of: {', '.join(sorted(data_builder.SUPPORTED_EXTENSIONS))}."
        )

    data_builder.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    temp_path = data_builder.UPLOADS_DIR / f"_streamlit_{mode}_{datetime.now():%Y%m%d%H%M%S%f}{suffix}"
    temp_path.write_bytes(uploaded_file.getvalue())
    return data_builder.activate_uploaded_dataset(temp_path, uploaded_file.name, mode=mode)


def build_embedded_dashboard_html(payload: dict, styles: str, script: str, active_mode: str) -> str:
    payload_json = json.dumps(payload).replace("</script>", "<\\/script>")
    safe_active_mode = "complaint" if active_mode == "complaint" else "general"

    return f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Call Center Dashboard</title>
    <style>
{styles}

      html, body {{
        margin: 0;
        padding: 0;
        background: transparent;
      }}

      .page-shell {{
        padding-top: 0;
      }}

      #mode-switch {{
        display: none !important;
      }}

      .analytics-upload-bar,
      .complaint-filter-tools {{
        display: none !important;
      }}
    </style>
  </head>
  <body>
    <div class="page-shell">
      <section class="panel mode-panel reveal" id="mode-switch" aria-live="polite"></section>

      <header class="hero panel reveal" id="hero">
        <p class="eyebrow">Loading dashboard...</p>
        <h1>Call Center Dashboard</h1>
      </header>

      <section class="panel analytics-section reveal" id="analytics" aria-live="polite"></section>

      <section class="section-head reveal" id="kpis-head"></section>
      <section class="kpi-grid reveal" id="kpis" aria-live="polite"></section>

      <section class="section-head reveal" id="trends-head"></section>
      <section class="trend-grid reveal" id="trends" aria-live="polite"></section>

      <section class="section-head reveal" id="category-head"></section>
      <section class="panel reveal" id="category-summary" aria-live="polite"></section>

      <section class="panel reveal" id="table" aria-live="polite"></section>
    </div>

    <script>
      window.__STREAMLIT_ACTIVE_MODE__ = "{safe_active_mode}";
      const __STREAMLIT_DASHBOARD_PAYLOAD__ = {payload_json};
      const __streamlitJsonResponse = (body, status = 200) =>
        new Response(JSON.stringify(body), {{
          status,
          headers: {{ "Content-Type": "application/json; charset=utf-8" }},
        }});
      const __streamlitOriginalFetch = window.fetch ? window.fetch.bind(window) : null;

      window.fetch = async (input, init = {{}}) => {{
        const url = typeof input === "string" ? input : input?.url ?? "";

        if (url.includes("api/dashboard-data") || url.includes("data/call-center-dashboard.json")) {{
          return __streamlitJsonResponse(__STREAMLIT_DASHBOARD_PAYLOAD__, 200);
        }}

        if (url.includes("api/upload-data")) {{
          return __streamlitJsonResponse(
            {{
              ok: false,
              message: "Use the Streamlit uploaders above the dashboard to update datasets.",
              details: [],
            }},
            400,
          );
        }}

        if (__streamlitOriginalFetch) {{
          return __streamlitOriginalFetch(input, init);
        }}

        throw new Error("Fetch is not available in this embedded Streamlit mode.");
      }};
    </script>
    <script type="module">
{script}
    </script>
  </body>
</html>
"""


def main() -> None:
    st.set_page_config(page_title="Call Center Dashboard", layout="wide")
    st.title("Call Center Dashboard")
    st.caption("Streamlit deployment wrapper for the existing General and Complaint dashboard modes.")

    warning_message = None
    if "dashboard_payload" not in st.session_state:
        payload, warning_message = load_dashboard_payload()
        st.session_state.dashboard_payload = payload

    st.subheader("Dashboard Mode")
    selected_mode_label = st.radio(
        "Switch dashboard context",
        options=["General", "Complaint"],
        horizontal=True,
        key="streamlit_dashboard_mode",
        label_visibility="collapsed",
    )
    selected_mode = selected_mode_label.lower()

    with st.container():
        st.subheader("Upload Dataset")
        upload_col_1, upload_col_2 = st.columns([1.7, 0.7])

        with upload_col_1:
            if selected_mode == "general":
                active_upload = st.file_uploader(
                    "General dataset (.xlsx or .csv)",
                    type=["xlsx", "csv"],
                    key="streamlit_general_upload",
                )
            else:
                active_upload = st.file_uploader(
                    "Complaint dataset (.xlsx or .csv)",
                    type=["xlsx", "csv"],
                    key="streamlit_complaint_upload",
                )

        with upload_col_2:
            st.write("")
            st.write("")
            apply_uploads = st.button(
                f"Apply {selected_mode_label} upload",
                type="primary",
                use_container_width=True,
            )

    st.info(
        f"You are uploading for {selected_mode_label} mode. Switch the mode above to upload the other dashboard dataset."
    )

    if warning_message:
        st.warning(warning_message)

    if apply_uploads:
        updated_payload = None
        try:
            if active_upload is None:
                st.info(f"Choose a {selected_mode_label.lower()} dataset before applying upload.")
            else:
                with st.spinner("Updating dashboard data..."):
                    updated_payload = apply_uploaded_dataset(active_upload, selected_mode)

                if updated_payload is not None:
                    st.session_state.dashboard_payload = updated_payload
                    st.success(f"{selected_mode_label} dashboard updated successfully from the uploaded dataset.")
        except Exception as error:
            st.error(f"Upload failed: {error}")

    if st.session_state.dashboard_payload is None:
        st.warning("No dashboard data is loaded yet. Upload a dataset for the selected mode to initialize the app.")
        return

    styles, script = load_dashboard_assets()
    html = build_embedded_dashboard_html(st.session_state.dashboard_payload, styles, script, selected_mode)
    components.html(html, height=DASHBOARD_HEIGHT, scrolling=True)


if __name__ == "__main__":
    main()
