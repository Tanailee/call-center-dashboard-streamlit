const root = {
  modeSwitch: document.querySelector("#mode-switch"),
  hero: document.querySelector("#hero"),
  analytics: document.querySelector("#analytics"),
  kpisHead: document.querySelector("#kpis-head"),
  kpis: document.querySelector("#kpis"),
  trendsHead: document.querySelector("#trends-head"),
  trends: document.querySelector("#trends"),
  categoryHead: document.querySelector("#category-head"),
  categorySummary: document.querySelector("#category-summary"),
  table: document.querySelector("#table"),
};

const apiDataPath = "./api/dashboard-data";
const fallbackDataPath = "./data/call-center-dashboard.json";
const uploadDataPath = "./api/upload-data";

let dashboardData = null;
let activeMode = globalThis.__STREAMLIT_ACTIVE_MODE__ ?? "general";
const selectedAnalyticsKeys = {
  general: null,
  complaint: null,
};
let apiAvailable = true;
let isUploading = false;
let uploadState = null;

const directionState = {
  showMode: "both",
  timeMode: "monthly",
  service: "all",
  showLabels: false,
  showAnnotations: true,
};

const categoryState = {
  service: "all",
  category: "all",
};

const complaintState = {
  issue: "all",
  detail: "all",
};

const CATEGORY_ALL_VALUE = "all";
const CATEGORY_ALL_LABEL = "All categories";
const UNCATEGORIZED_CATEGORY_LABEL = "Uncategorized";
const CATEGORY_SERVICE_GROUPS = Object.freeze({
  "P&S Non-credit": [
    "Account information inquiry",
    "Account Opening at Booth Event",
    "Account Opening inquiry",
    "Bank Confirmation inquiry",
    "Bank Guarantee/LC",
    "Bank Statement inquiry",
    "Bill Payment inquiry",
    "Block Fund inquiry",
    "CASA Account Inquiry",
    "Cash Deposit inquiry",
    "Cash Withdrawal inquiry",
    "Check balance inquiry",
    "Chq Inquiry",
    "Close account inquiry",
    "Corperate account inquiry",
    "Counterfeit Bank note",
    "Cross-border Thai/Viet QR",
    "Deceased Account",
    "Demaged/Dirty Bank note",
    "Dormant Account",
    "EMQ Inquiry",
    "ETC request reversal",
    "ETC-OBU Usage/Inquiry",
    "Exchange Rate Inquiry",
    "Digital account usage/inquiry",
    "EZ Post no debit inquiry",
    "Fee & Charge P & S",
    "Fixed Account Inquiry",
    "Follow up-Referral with branch",
    "Follow up-Update KYC/Amend at Branch",
    "Fund Transfer",
    "Gov't Border Foundation",
    "Information Amendment",
    "Junior Account Inquiry",
    "KHQR Merchant inquiry",
    "Local transfer inquiry",
    "MoneyGram Inquiry",
    "NBC-KHR account opening",
    "Ongoing balance inquiry",
    "Oversea ITT/OTT inquiry",
    "Prathana Account Inquiry",
    "Premium Business/Elite account",
    "Reactivate account",
    "Request check transaction",
    "Retiree salary inquiry",
    "RGC Payroll Account",
    "Special account number inquiry",
    "Suspicious fraud inquiry",
    "Tax Payment",
    "Teen Account inquiry",
    "Trade Finance Inquiry",
    "Transfer to wrong account",
    "Wedding account inquiry",
  ],
  "Online Banking": [
    "Bakong Maintenance",
    "CanaPoint inquiry",
    "CIB Daliy Limit",
    "CIB Usage inquiry",
    "CIB-Login issue",
    "CIB-Registration",
    "CIB-Request block CIB",
    "CIB-Transfer inquiry/Issue",
    "CIB-Unblock/Reset pin inquiry",
    "CIB-Unsubscribe inquiry",
    "IB Daily Limit",
    "IB Login Issue",
    "IB Registration inquiry",
    "IB Transfer Inquiry/issue",
    "IB Unsubscribe",
    "IB usage inquiry",
    "IB-Block inquiry",
    "IB-Unblock/Reset pin inquiry",
    "MB Activation inquiry",
    "MB Daily Limit",
    "MB Function inquiry",
    "MB Login issue",
    "MB Reset Cre/90days inquiry",
    "MB Scan/Transfer inquiry",
    "MB unblock inquiry",
    "MBV5 migration inquiry",
    "OTP Failure inquiry",
    "Outbound-Block/Unblock MB",
    "Outbound-Form MB",
    "Phone top up failed",
    "Request Block Bakong",
    "Request Block MB",
    "Token unblock inquiry",
    "Token usage inquiry",
    "V3-Activation",
    "V3-Alert KHR account issue",
    "V3-Forgot PIN",
    "V5-Activation",
    "V5-Credential",
  ],
  "Bank Card": [
    "ATM Cash deposit inquiry",
    "ATM Cash withdrawal inquiry",
    "ATM Location",
    "ATM Machine usage/issue",
    "Block Card inquiry",
    "Card Annual fee",
    "Card capture inquiry",
    "Card Inquiry",
    "Card Limit inquiry",
    "Card Payment inquiry",
    "Card Pick up/Process",
    "Card Promotion inquiry",
    "Card Renewal/Replace",
    "Card Scan/Payment issue",
    "Card Transfer inquiry",
    "Cash Retracted inquiry",
    "Check Card Transaction",
    "Close card inquiry",
    "Credit card inquiry",
    "CRM Location",
    "Follow up-Card Opening",
    "Forget pin card",
    "Forgot card at ATM",
    "Late send statment Credit Card",
    "Lost Card",
    "Online Payment",
    "POS Machine inquiry",
    "QR withdrawal at ATM",
    "Rental Space for ATM Machine",
    "Request check Card issue",
    "Request delivery card to Branch",
    "Request New Card",
    "SEM Inquiry",
    "TAT-Request new card",
    "Unblock Card inquiry",
    "Virtual VISA/Master debit card",
    "VTM Inquiry",
    "VTM Location",
  ],
  "Outbound Project": [
    "Outbound-Merchant winner",
    "Outbound- Disable individual IB",
    "Outbound- Property Tax payment",
    "Outbound- Vehicle Tax payment",
    "Outbound-After sale service",
    "Outbound-Credit card",
    "Outbound-CSS Card",
    "Outbound-Customer care",
    "Outbound-ETC",
    "Outbound-Digital Account",
    "Outbound-KHR Account",
    "Outbound-Sunset V3",
    "Outbound-MG Survey-Promotion",
    "Outbound-OBU promotion",
    "Outbound-OTT Lucky Draw",
    "Outbound-Promotion winner",
    "Outbound-request from email",
    "Outbound-Sovannphumi insurance",
    "Outbound-Suspicious canapoint",
    "Outbound-MoneyGram Winner Lucky",
    "Outbound-TIA winner",
    "Outbound-True money Agent",
  ],
  "General Inquiry": [
    "Bank Operation",
    "Bank promotion",
    "Booking Room",
    "Branch Contact Number",
    "Branch Location",
    "Call Abandoned",
    "Cana Securities Inquiry",
    "Cana Trust inquiry",
    "CEO Office Inquiry",
    "Chairman Office Inquiry",
    "CNB Tower leasing info",
    "COE support",
    "ESCROW Service",
    "Facebook ad click",
    "Forgot document at Branch",
    "Good feedback from customer",
    "Got missed call from hotline",
    "HR-Apply Job",
    "HR-Job Interview",
    "HR-Staff join first day",
    "HR-Staff signed contract",
    "Insurance Inquiry",
    "Internal extention inquiry",
    "Non exist P&S",
    "OCIC inquiry",
    "Other Inquiry",
    "Other invitation",
    "Rating review on Branch",
    "Reply-Internal email",
    "Staff behaviour inquiry",
    "TAT-Hotline number",
    "Walk in-meet internal/Loan",
  ],
  Loan: [
    "Block fund for loan inquiry",
    "Collatoral withdrawal inquiry",
    "Loan disbursement inquiry",
    "Loan Inquiry",
    "Loan Late Payment",
    "Loan NPL",
    "Loan Paid Off",
    "Loan Payment Inquiry",
    "Loan Request",
    "Loan signed contract",
  ],
});
const CATEGORY_SERVICE_OPTIONS = Object.freeze(Object.keys(CATEGORY_SERVICE_GROUPS));
const CATEGORY_TO_SERVICE = new Map(
  CATEGORY_SERVICE_OPTIONS.flatMap((service) =>
    CATEGORY_SERVICE_GROUPS[service].map((category) => [normalizeCategoryLookup(category), service]),
  ),
);
const CATEGORY_MAPPED_ORDER = Object.freeze(
  CATEGORY_SERVICE_OPTIONS.flatMap((service) => CATEGORY_SERVICE_GROUPS[service]),
);
const CATEGORY_CANONICAL_LABELS = new Map(
  CATEGORY_MAPPED_ORDER.map((category) => [normalizeCategoryLookup(category), category]),
);

let directionViewCache = new Map();

init();

async function init() {
  try {
    const data = await loadDashboardData();
    setDashboardData(data);
    renderDashboard(dashboardData);
  } catch (error) {
    renderError(error);
  }
}

async function loadDashboardData() {
  try {
    const response = await fetch(apiDataPath, { cache: "no-store" });
    if (!response.ok) {
      const body = await safeParseJson(response);
      const error = new Error(body?.message ?? `Dashboard API returned ${response.status}`);
      error.details = body?.details ?? [];
      throw error;
    }
    apiAvailable = true;
    return response.json();
  } catch (error) {
    const fallbackResponse = await fetch(fallbackDataPath, { cache: "no-store" });
    if (!fallbackResponse.ok) {
      throw error;
    }
    apiAvailable = false;
    uploadState = {
      type: "warning",
      message: "Upload is available when the dashboard is started with the local upload server.",
      details: ["Run `python .\\server.py` in the dashboard folder to enable uploads."],
    };
    return fallbackResponse.json();
  }
}

async function safeParseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function setDashboardData(data) {
  dashboardData = data;
  const modeOptions = Array.isArray(data?.modeOptions) ? data.modeOptions : [];
  const validModeKeys = modeOptions.filter((item) => item?.available !== false).map((item) => String(item.key));
  if (!validModeKeys.includes(activeMode)) {
    activeMode = validModeKeys[0] ?? data?.defaultMode ?? "general";
  }
  directionViewCache = new Map();
}

function renderDashboard(data) {
  renderModeSwitch(data?.modeOptions ?? []);
  const payload = getActiveModePayload(data);
  const complaintView = activeMode === "complaint" ? deriveComplaintView(payload) : null;
  renderSectionHeads(payload?.sectionHeadings ?? {});
  renderHero(payload?.meta ?? {});
  renderAnalytics(payload?.analytics ?? {}, complaintView);
  renderKpis(payload?.kpis ?? [], complaintView);
  if (activeMode === "complaint") {
    renderComplaintTrends(complaintView);
    renderComplaintSummary(complaintView);
  } else {
    renderTrends(payload?.trends ?? {});
    renderCategorySummary(payload?.categoryAnalysis ?? {});
  }
  renderTable(payload?.table ?? { rows: [] }, complaintView);
}

function getActiveModePayload(data) {
  if (data?.modes && typeof data.modes === "object") {
    return data.modes[activeMode] ?? data.modes.general ?? Object.values(data.modes)[0] ?? {};
  }
  return data ?? {};
}

function renderModeSwitch(modeOptions = []) {
  if (!root.modeSwitch) {
    return;
  }

  const options = modeOptions.length
    ? modeOptions
    : [
        { key: "general", label: "General", available: true },
        { key: "complaint", label: "Complaint", available: false },
      ];

  root.modeSwitch.innerHTML = `
    <div class="mode-copy">
      <p class="eyebrow">Dashboard mode</p>
      <h2 class="mode-title">Switch dashboard context</h2>
    </div>
    <div class="analytics-controls mode-controls">
      ${options
        .map(
          (option) => `
            <button
              type="button"
              class="analytics-toggle${String(option.key) === activeMode ? " is-active" : ""}"
              data-dashboard-mode="${escapeHtml(String(option.key))}"
              ${option.available === false ? "disabled" : ""}
            >
              ${escapeHtml(String(option.label ?? option.key))}
            </button>
          `,
        )
        .join("")}
    </div>
  `;

  root.modeSwitch.querySelectorAll("[data-dashboard-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      activeMode = button.getAttribute("data-dashboard-mode") ?? "general";
      renderDashboard(dashboardData);
    });
  });
}

function renderSectionHeads(sectionHeadings = {}) {
  renderSectionHead(root.kpisHead, sectionHeadings.kpis, {
    eyebrow: "Headline KPIs",
    title: "Operational pulse",
    copy: "Top-line customer service center health for the current workbook snapshot.",
  });
  renderSectionHead(root.trendsHead, sectionHeadings.trends, {
    eyebrow: "Trends",
    title: "Volume and mix",
    copy: "Trend cards are intentionally thin so they can be swapped to live API series later.",
  });
  renderSectionHead(root.categoryHead, sectionHeadings.category, {
    eyebrow: "Category Summary",
    title: "Inquiry categorization",
    copy: "Review category coverage, isolate uncategorized inquiries, and keep the category summary management-friendly.",
  });
}

function renderSectionHead(target, section = {}, fallback = {}) {
  if (!target) {
    return;
  }

  target.innerHTML = `
    <div>
      <p class="eyebrow">${escapeHtml(section.eyebrow ?? fallback.eyebrow ?? "")}</p>
      <h2>${escapeHtml(section.title ?? fallback.title ?? "")}</h2>
    </div>
    <p class="section-copy">${escapeHtml(section.copy ?? fallback.copy ?? "")}</p>
  `;
}

function renderHero(meta = {}) {
  const sourceFile = basename(meta.sourceWorkbook ?? "");
  root.hero.innerHTML = `
    <p class="eyebrow">${escapeHtml(meta.eyebrow ?? "Customer service center dashboard")}</p>
    <h1>${escapeHtml(meta.title ?? "Canadia Bank Call Center Dashboard")}</h1>
    <p class="hero-copy">${escapeHtml(meta.subtitle ?? "Customer service center dashboard shell.")}</p>
    <div class="hero-meta">
      <span class="meta-pill">Window: ${escapeHtml(meta.windowLabel ?? "Sample snapshot")}</span>
      <span class="meta-pill">Updated: ${escapeHtml(meta.generatedAtLabel ?? "Unknown")}</span>
      <span class="meta-pill">Source: ${escapeHtml(sourceFile || "Local JSON")}</span>
    </div>
  `;
}

function renderAnalytics(analytics = {}, complaintView = null) {
  if (activeMode === "complaint") {
    renderComplaintAnalytics(analytics, complaintView);
    return;
  }

  const variants = analytics.variants ?? [];

  if (!variants.length) {
    root.analytics.innerHTML = `<div class="empty-state">No analytics are available yet.</div>`;
    return;
  }

  const activeKey = selectedAnalyticsKeys[activeMode] ?? analytics.defaultKey ?? variants[0]?.key;
  const activeVariant = variants.find((item) => item.key === activeKey) ?? variants[0];
  selectedAnalyticsKeys[activeMode] = activeVariant?.key ?? null;

  const isDirection = isDirectionVariant(activeVariant);
  syncDirectionState(activeVariant);
  const directionView = isDirection ? deriveDirectionBiView(activeVariant) : null;

  root.analytics.innerHTML = `
    <p class="eyebrow analytics-section-label">${escapeHtml(analytics.eyebrow ?? "Operational Analytics")}</p>
    <div class="analytics-upload-bar">
      <div class="upload-row">
        <input id="dataset-upload-input" class="upload-input" type="file" accept=".xlsx,.csv" />
        <button
          type="button"
          class="upload-button"
          id="upload-data-button"
          ${apiAvailable && !isUploading ? "" : "disabled"}
        >
          ${isUploading ? "Uploading..." : "Upload Data"}
        </button>
      </div>
    </div>
    ${renderUploadState()}
    <div class="analytics-controls">
      ${variants
        .map(
          (variant) => `
            <button
              type="button"
              class="analytics-toggle${variant.key === activeVariant?.key ? " is-active" : ""}"
              data-analytics-key="${escapeHtml(variant.key)}"
            >
              ${escapeHtml(variant.label)}
            </button>
          `,
        )
        .join("")}
    </div>
    ${
      isDirection
        ? renderDirectionAnalyticsLayout(activeVariant, directionView)
        : renderStandardAnalyticsLayout(activeVariant, analytics.highlights ?? [])
    }
  `;

  attachAnalyticsHandlers(activeVariant, directionView);
}

function renderStandardAnalyticsLayout(activeVariant, highlights) {
  return `
    <div class="analytics-layout">
      <article class="analytics-chart-card">
        <div class="chart-head">
          <div>
            <p class="eyebrow">Primary chart</p>
            <h3>${escapeHtml(activeVariant?.chartTitle ?? "Customer volume")}</h3>
            <p class="chart-note">${escapeHtml(activeVariant?.chartNote ?? "This chart updates from the currently loaded dataset.")}</p>
          </div>
          <span class="chip">${escapeHtml(String(activeVariant?.series?.length || 0))} groups</span>
        </div>
        <div class="chart-frame">
          ${renderAnalyticsVariant(activeVariant)}
        </div>
      </article>
      <aside class="analytics-side">
        ${renderHighlightCards(highlights)}
      </aside>
    </div>
  `;
}

function renderDirectionAnalyticsLayout(variant, view) {
  return `
    <div class="analytics-layout analytics-layout-bi">
      <article class="analytics-chart-card analytics-chart-card-bi">
        ${renderDirectionModule(variant, view)}
      </article>
      <aside class="analytics-side analytics-side-bi">
        ${renderDirectionInsights(view)}
      </aside>
    </div>
  `;
}

function renderHighlightCards(highlights) {
  if (!highlights.length) {
    return `<div class="empty-state">No highlight metrics are available.</div>`;
  }

  return highlights
    .map(
      (item) => `
        <article class="analytics-mini-card">
          <p class="mini-label">${escapeHtml(item.label)}</p>
          <h3 class="mini-value">${escapeHtml(item.value)}</h3>
          <p class="mini-copy">${escapeHtml(item.context ?? "")}</p>
        </article>
      `,
    )
    .join("");
}

function renderUploadState() {
  if (!uploadState) {
    return "";
  }

  return `
    <div class="upload-status upload-status-${escapeHtml(uploadState.type ?? "info")}" role="status" aria-live="polite">
      <p class="upload-status-message">${escapeHtml(uploadState.message ?? "")}</p>
      ${
        uploadState.details?.length
          ? `<ul class="upload-status-list">${uploadState.details.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
          : ""
      }
    </div>
  `;
}

function attachUploadHandlers(container) {
  const uploadButton = container?.querySelector("#upload-data-button");
  const uploadInput = container?.querySelector("#dataset-upload-input");
  if (!uploadButton || !uploadInput) {
    return;
  }

  uploadButton.addEventListener("click", () => {
    if (!apiAvailable || isUploading) {
      return;
    }
    uploadInput.click();
  });

  uploadInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    await handleDatasetUpload(file);
  });
}

function renderComplaintAnalytics(analytics = {}, view = null) {
  const safeView = view ?? deriveComplaintView(getActiveModePayload(dashboardData));
  const complaintModule = getActiveModePayload(dashboardData)?.complaintModule ?? {};
  const fieldLabels = complaintModule.fieldLabels ?? {};
  const scopeText =
    complaintState.issue === "all"
      ? "Showing all complaint rows across the fixed management taxonomy."
      : complaintState.detail === "all"
        ? `Showing all mapped detail rows under ${safeView?.selectedIssueLabel ?? "the selected main issue"}.`
        : `Showing only complaint rows mapped to ${safeView?.selectedDetailLabel ?? "the selected detail"} under ${safeView?.selectedIssueLabel ?? "the selected main issue"}.`;

  root.analytics.innerHTML = `
    <div class="complaint-filter-panel">
      <div class="complaint-filter-tools">
        <div class="upload-row">
          <input id="dataset-upload-input" class="upload-input" type="file" accept=".xlsx,.csv" />
          <button
            type="button"
            class="upload-button"
            id="upload-data-button"
            ${apiAvailable && !isUploading ? "" : "disabled"}
          >
            ${isUploading ? "Uploading..." : "Upload Data"}
          </button>
        </div>
      </div>
      ${renderUploadState()}
      <div class="complaint-filter-grid">
        <label class="bi-control-group bi-control-group-select">
          <span class="bi-control-label">Main Issue</span>
          <select id="complaint-issue-filter" class="bi-select">
            ${safeView?.issueOptions
              ?.map(
                (option) => `
                  <option value="${escapeHtml(option.value)}"${option.value === complaintState.issue ? " selected" : ""}>
                    ${escapeHtml(option.label)}
                  </option>
                `,
              )
              .join("") ?? ""}
          </select>
        </label>
        <label class="bi-control-group bi-control-group-select">
          <span class="bi-control-label">Detail</span>
          <select id="complaint-detail-filter" class="bi-select">
            ${safeView?.detailOptions
              ?.map(
                (option) => `
                  <option value="${escapeHtml(option.value)}"${option.value === complaintState.detail ? " selected" : ""}>
                    ${escapeHtml(option.label)}
                  </option>
                `,
              )
              .join("") ?? ""}
          </select>
        </label>
      </div>
      <p class="bi-filter-caption">${escapeHtml(scopeText)}</p>
      <div class="complaint-filter-metrics">
        <article class="analytics-mini-card analytics-mini-card-neutral">
          <p class="mini-label">Complaints in scope</p>
          <h3 class="mini-value">${formatNumber(Number(safeView?.totalComplaints ?? 0))}</h3>
          <p class="mini-copy">All charts, summaries, and tables use the same filtered complaint scope.</p>
        </article>
        <article class="analytics-mini-card analytics-mini-card-neutral">
          <p class="mini-label">Main issue groups</p>
          <h3 class="mini-value">${formatNumber(Number(safeView?.issueScopeCount ?? safeView?.issueRows?.length ?? 0))}</h3>
          <p class="mini-copy">Fixed management taxonomy using ${escapeHtml(fieldLabels.issue ?? "Issue")} and related complaint fields.</p>
        </article>
        <article class="analytics-mini-card analytics-mini-card-neutral">
          <p class="mini-label">Detail groups</p>
          <h3 class="mini-value">${formatNumber(Number(safeView?.detailScopeCount ?? safeView?.detailRows?.length ?? 0))}</h3>
          <p class="mini-copy">Zero-count detail rows stay visible even when no complaint matches the selected scope.</p>
        </article>
      </div>
      ${
        safeView?.warnings?.length
          ? `<div class="upload-status upload-status-warning" role="status"><p class="upload-status-message">Some complaint metrics use fallback mapping or have limited source columns.</p><ul class="upload-status-list">${safeView.warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>`
          : ""
      }
    </div>
  `;

  attachUploadHandlers(root.analytics);

  const issueSelect = root.analytics.querySelector("#complaint-issue-filter");
  issueSelect?.addEventListener("change", () => {
    complaintState.issue = issueSelect.value || "all";
    complaintState.detail = "all";
    renderDashboard(dashboardData);
  });

  const detailSelect = root.analytics.querySelector("#complaint-detail-filter");
  detailSelect?.addEventListener("change", () => {
    complaintState.detail = detailSelect.value || "all";
    renderDashboard(dashboardData);
  });
}

function attachAnalyticsHandlers(activeVariant, directionView) {
  root.analytics.querySelectorAll("[data-analytics-key]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedAnalyticsKeys[activeMode] = button.getAttribute("data-analytics-key");
      renderAnalytics(getActiveModePayload(dashboardData)?.analytics ?? {});
    });
  });

  attachUploadHandlers(root.analytics);

  if (!isDirectionVariant(activeVariant) || !directionView) {
    return;
  }

  root.analytics.querySelectorAll("[data-direction-show-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      directionState.showMode = button.getAttribute("data-direction-show-mode") ?? "both";
      renderAnalytics(getActiveModePayload(dashboardData)?.analytics ?? {});
    });
  });

  root.analytics.querySelectorAll("[data-direction-time-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      directionState.timeMode = button.getAttribute("data-direction-time-mode") ?? "monthly";
      renderAnalytics(getActiveModePayload(dashboardData)?.analytics ?? {});
    });
  });

  root.analytics.querySelectorAll("[data-direction-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const field = button.getAttribute("data-direction-toggle");
      if (field === "labels") {
        directionState.showLabels = !directionState.showLabels;
      } else if (field === "annotations") {
        directionState.showAnnotations = !directionState.showAnnotations;
      }
      renderAnalytics(getActiveModePayload(dashboardData)?.analytics ?? {});
    });
  });

  const serviceSelect = root.analytics.querySelector("#direction-service-filter");
  if (serviceSelect) {
    serviceSelect.addEventListener("change", () => {
      directionState.service = serviceSelect.value || "all";
      renderAnalytics(getActiveModePayload(dashboardData)?.analytics ?? {});
    });
  }

  const exportCsvButton = root.analytics.querySelector("#direction-export-csv");
  exportCsvButton?.addEventListener("click", () => {
    exportDirectionCsv(directionView);
  });

  const exportChartButton = root.analytics.querySelector("#direction-export-chart");
  exportChartButton?.addEventListener("click", () => {
    exportDirectionChartSvg();
  });

  attachDirectionTooltipInteractions(directionView);
}

async function handleDatasetUpload(file) {
  if (!apiAvailable) {
    uploadState = {
      type: "warning",
      message: "Upload is available when the dashboard is started with the local upload server.",
      details: ["Run `python .\\server.py` in the dashboard folder to enable uploads."],
    };
    renderAnalytics(getActiveModePayload(dashboardData)?.analytics ?? {});
    return;
  }

  const extension = `.${(file.name.split(".").pop() ?? "").toLowerCase()}`;
  if (![".xlsx", ".csv"].includes(extension)) {
    uploadState = {
      type: "warning",
      message: "Uploaded file format is invalid. Please upload a file matching the required dataset structure.",
      details: ["Supported file types: .csv, .xlsx."],
    };
    renderAnalytics(getActiveModePayload(dashboardData)?.analytics ?? {});
    return;
  }

  isUploading = true;
  uploadState = {
    type: "info",
    message: "Uploading and processing dataset...",
    details: ["Please wait while the dashboard validates and refreshes your data."],
  };
  renderAnalytics(getActiveModePayload(dashboardData)?.analytics ?? {});

  try {
    const formData = new FormData();
    formData.append("dataset", file);
    formData.append("mode", activeMode);

    const response = await fetch(uploadDataPath, {
      method: "POST",
      body: formData,
    });
    const body = await safeParseJson(response);

    if (!response.ok || !body?.ok) {
      uploadState = {
        type: "warning",
        message:
          body?.message ??
          "Uploaded file format is invalid. Please upload a file matching the required dataset structure.",
        details: body?.details ?? [],
      };
      renderAnalytics(getActiveModePayload(dashboardData)?.analytics ?? {});
      return;
    }

    setDashboardData(body.payload);
    uploadState = {
      type: "success",
      message: body.message ?? "Data uploaded and dashboard updated successfully.",
      details: [],
    };
    renderDashboard(dashboardData);
  } catch {
    uploadState = {
      type: "warning",
      message: "The selected file could not be processed. Please upload a valid .xlsx or .csv dataset.",
      details: [],
    };
    renderAnalytics(getActiveModePayload(dashboardData)?.analytics ?? {});
  } finally {
    isUploading = false;
    renderAnalytics(getActiveModePayload(dashboardData)?.analytics ?? {});
  }
}

function renderDirectionModule(variant, view) {
  const timeMeta = getDirectionTimeMeta(directionState.timeMode);
  const latestLabel = view.latestPeriod?.label ?? "--";
  const previousLabel = view.previousPeriod?.label ?? "--";
  const latestChange = view.latestPeriod?.changePct ?? null;
  const changeDirection = classifyTrend(latestChange);

  return `
    <div class="chart-head bi-chart-head">
      <div>
        <p class="eyebrow">Primary chart</p>
        <h3>${escapeHtml(variant?.chartTitle ?? "Inbound vs outbound by month")}</h3>
        <p class="chart-note">${escapeHtml(variant?.chartNote ?? "Month-over-month direction split from the uploaded dataset.")}</p>
      </div>
      <div class="bi-head-actions">
        <span class="chip">${escapeHtml(String(view.periods.length || 0))} groups</span>
      </div>
    </div>
    ${
      view.periods.length
        ? `
          <div class="bi-kpi-grid">
            <article class="bi-kpi-card">
              <p class="bi-kpi-label">Total Inbound</p>
              <h4 class="bi-kpi-value bi-kpi-value-brand">${formatNumber(view.totalInbound)}</h4>
            </article>
            <article class="bi-kpi-card">
              <p class="bi-kpi-label">Total Outbound</p>
              <h4 class="bi-kpi-value bi-kpi-value-highlight">${formatNumber(view.totalOutbound)}</h4>
            </article>
            <article class="bi-kpi-card">
              <p class="bi-kpi-label">Total Volume</p>
              <h4 class="bi-kpi-value">${formatNumber(view.totalVolume)}</h4>
            </article>
            <article class="bi-kpi-card">
              <p class="bi-kpi-label">Unknown Type Inquiries</p>
              <h4 class="bi-kpi-value">${formatNumber(view.totalUnknown)}</h4>
            </article>
            <article class="bi-kpi-card">
              <p class="bi-kpi-label">Inbound vs Outbound ratio</p>
              <h4 class="bi-kpi-value">${escapeHtml(formatRatioLabel(view.inboundShare, view.outboundShare))}</h4>
            </article>
          </div>
          ${renderDirectionControls(view)}
          <div class="chart-frame bi-chart-frame">
            <div class="chart-legend bi-legend">
              ${directionState.showMode !== "outbound" ? `<span class="legend-item"><span class="legend-swatch legend-swatch-brand"></span>Inbound</span>` : ""}
              ${directionState.showMode !== "inbound" ? `<span class="legend-item"><span class="legend-swatch legend-swatch-highlight"></span>Outbound</span>` : ""}
              <span class="legend-item"><span class="legend-line-swatch"></span>Total trend</span>
              <span class="legend-item"><span class="legend-marker-swatch legend-marker-swatch-peak"></span>Peak</span>
              <span class="legend-item"><span class="legend-marker-swatch legend-marker-swatch-low"></span>Low</span>
            </div>
            <div class="bi-chart-shell">
              <div class="direction-tooltip" id="direction-tooltip" role="tooltip" aria-hidden="true"></div>
              ${renderDirectionChart(view, variant)}
            </div>
          </div>
        `
        : `
          <div class="empty-state">
            No direction data is available for the current filters. Try another service or upload a dataset with valid inbound and outbound values.
          </div>
        `
    }
  `;
}

function renderDirectionControls(view) {
  return `
    <div class="bi-control-panel">
      <div class="bi-control-group">
        <p class="bi-control-label">Series</p>
        <div class="bi-pill-row">
          ${[
            ["both", "Show Both"],
            ["inbound", "Inbound only"],
            ["outbound", "Outbound only"],
          ]
            .map(
              ([value, label]) => `
                <button
                  type="button"
                  class="bi-pill${directionState.showMode === value ? " is-active" : ""}"
                  data-direction-show-mode="${escapeHtml(value)}"
                >
                  ${escapeHtml(label)}
                </button>
              `,
            )
            .join("")}
        </div>
      </div>
      <div class="bi-control-group">
        <p class="bi-control-label">Time filter</p>
        <div class="bi-pill-row">
          ${[
            ["monthly", "Monthly"],
            ["quarterly", "Quarterly"],
            ["yearly", "Yearly"],
          ]
            .map(
              ([value, label]) => `
                <button
                  type="button"
                  class="bi-pill${directionState.timeMode === value ? " is-active" : ""}"
                  data-direction-time-mode="${escapeHtml(value)}"
                >
                  ${escapeHtml(label)}
                </button>
              `,
            )
            .join("")}
        </div>
      </div>
      ${
        view.serviceOptions.length
          ? `
            <label class="bi-control-group bi-control-group-select">
              <span class="bi-control-label">Service</span>
              <select id="direction-service-filter" class="bi-select">
                <option value="all"${directionState.service === "all" ? " selected" : ""}>All services</option>
                ${view.serviceOptions
                  .map(
                    (service) => `
                      <option value="${escapeHtml(service)}"${directionState.service === service ? " selected" : ""}>
                        ${escapeHtml(service)}
                      </option>
                    `,
                  )
                  .join("")}
              </select>
            </label>
          `
          : ""
      }
      <div class="bi-control-group">
        <p class="bi-control-label">Display</p>
        <div class="bi-pill-row">
          <button
            type="button"
            class="bi-pill${directionState.showLabels ? " is-active" : ""}"
            data-direction-toggle="labels"
          >
            ${directionState.showLabels ? "Hide labels" : "Show labels"}
          </button>
          <button
            type="button"
            class="bi-pill${directionState.showAnnotations ? " is-active" : ""}"
            data-direction-toggle="annotations"
          >
            ${directionState.showAnnotations ? "Annotations on" : "Annotations off"}
          </button>
        </div>
      </div>
      <div class="bi-control-group">
        <p class="bi-control-label">Export</p>
        <div class="bi-pill-row">
          <button type="button" class="bi-pill bi-pill-ghost" id="direction-export-chart">Export Chart</button>
          <button type="button" class="bi-pill bi-pill-ghost" id="direction-export-csv">Export CSV</button>
        </div>
      </div>
      <p class="bi-filter-caption">
        Showing ${escapeHtml(directionState.service === "all" ? "all services" : directionState.service)} across the ${escapeHtml(getDirectionTimeMeta(directionState.timeMode).label.toLowerCase())} view.
      </p>
    </div>
  `;
}

function renderDirectionChart(view, variant) {
  if (!view.periods.length) {
    return `<div class="empty-state">No direction data is available.</div>`;
  }

  const width = 860;
  const height = 360;
  const paddingTop = 26;
  const paddingRight = 26;
  const paddingBottom = 70;
  const paddingLeft = 76;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const periods = view.periods;
  const showInbound = directionState.showMode !== "outbound";
  const showOutbound = directionState.showMode !== "inbound";
  const maxValue = Math.max(
    ...periods.map((period) => Math.max(period.total, showInbound ? period.inbound : 0, showOutbound ? period.outbound : 0)),
    1,
  );
  const scale = computeNiceScale(maxValue, 5);
  const plotMax = scale.max;
  const groupWidth = chartWidth / Math.max(periods.length, 1);
  const barCount = showInbound && showOutbound ? 2 : 1;
  const barGap = barCount === 2 ? Math.min(8, groupWidth * 0.08) : 0;
  const barWidth = Math.min(barCount === 2 ? 22 : 32, groupWidth * (barCount === 2 ? 0.25 : 0.34));
  const labelStep = periods.length > 18 ? 3 : periods.length > 10 ? 2 : 1;
  const valueToY = (value) => paddingTop + chartHeight - (value / plotMax) * chartHeight;
  const linePoints = periods.map((period, index) => {
    const centerX = paddingLeft + groupWidth * index + groupWidth / 2;
    return {
      ...period,
      index,
      centerX,
      totalY: valueToY(period.total),
      inboundY: valueToY(period.inbound),
      outboundY: valueToY(period.outbound),
    };
  });
  const linePath = createSmoothPath(linePoints.map((point) => ({ x: point.centerX, y: point.totalY })));
  const peakPoint = linePoints.find((point) => point.key === view.bestPeriod?.key) ?? null;
  const lowPoint = linePoints.find((point) => point.key === view.worstPeriod?.key) ?? null;
  const activeAnnotations = directionState.showAnnotations ? view.annotations : [];
  const yAxisLabel = escapeHtml(variant?.yAxisLabel ?? "Number of Customers");

  return `
    <svg
      class="chart-svg bi-direction-svg"
      id="direction-bi-svg"
      viewBox="0 0 ${width} ${height}"
      role="img"
      aria-label="Inbound versus outbound direction analytics chart"
    >
      <defs>
        <filter id="biLineShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="rgba(30,39,73,0.12)" />
        </filter>
      </defs>
      <text class="bi-axis-title" x="20" y="${paddingTop + chartHeight / 2}" text-anchor="middle" transform="rotate(-90 20 ${paddingTop + chartHeight / 2})">${yAxisLabel}</text>
      ${scale.ticks
        .map((tick) => {
          const y = valueToY(tick);
          return `
            <line class="chart-grid-line bi-grid-line" x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" />
            <text class="chart-axis-label bi-axis-tick" x="${paddingLeft - 10}" y="${y + 4}" text-anchor="end">${formatNumber(tick)}</text>
          `;
        })
        .join("")}
      ${
        peakPoint
          ? `<rect class="bi-group-band bi-group-band-peak" x="${peakPoint.centerX - groupWidth * 0.42}" y="${paddingTop}" width="${groupWidth * 0.84}" height="${chartHeight}" rx="18" ry="18"></rect>`
          : ""
      }
      ${
        lowPoint && lowPoint.key !== peakPoint?.key
          ? `<rect class="bi-group-band bi-group-band-low" x="${lowPoint.centerX - groupWidth * 0.42}" y="${paddingTop}" width="${groupWidth * 0.84}" height="${chartHeight}" rx="18" ry="18"></rect>`
          : ""
      }
      <line class="bi-axis-line" x1="${paddingLeft}" y1="${paddingTop + chartHeight}" x2="${width - paddingRight}" y2="${paddingTop + chartHeight}" />
      ${linePoints
        .map((point) => {
          const inboundX = showInbound && showOutbound ? point.centerX - barWidth - barGap / 2 : point.centerX - barWidth / 2;
          const outboundX = showInbound && showOutbound ? point.centerX + barGap / 2 : point.centerX - barWidth / 2;
          const inboundHeight = (point.inbound / plotMax) * chartHeight;
          const outboundHeight = (point.outbound / plotMax) * chartHeight;
          const xLabel = point.index % labelStep === 0 ? point.shortLabel : "";
          const barLabelY = Math.min(point.inboundY, point.outboundY, point.totalY) - 10;

          return `
            ${
              showInbound
                ? `<rect class="bi-direction-bar bi-direction-bar-inbound" x="${inboundX}" y="${point.inboundY}" width="${barWidth}" height="${inboundHeight}" rx="10" ry="10"></rect>`
                : ""
            }
            ${
              showOutbound
                ? `<rect class="bi-direction-bar bi-direction-bar-outbound" x="${outboundX}" y="${point.outboundY}" width="${barWidth}" height="${outboundHeight}" rx="10" ry="10"></rect>`
                : ""
            }
            ${
              directionState.showLabels
                ? `
                  ${
                    showInbound
                      ? `<text class="bi-bar-value" x="${inboundX + barWidth / 2}" y="${Math.max(point.inboundY - 8, 16)}" text-anchor="middle">${formatNumber(point.inbound)}</text>`
                      : ""
                  }
                  ${
                    showOutbound
                      ? `<text class="bi-bar-value" x="${outboundX + barWidth / 2}" y="${Math.max(point.outboundY - 8, 16)}" text-anchor="middle">${formatNumber(point.outbound)}</text>`
                      : ""
                  }
                `
                : ""
            }
            <text class="chart-axis-label bi-axis-label-x" x="${point.centerX}" y="${height - 18}" text-anchor="middle">${escapeHtml(xLabel)}</text>
            <rect
              class="bi-hitbox"
              x="${point.centerX - groupWidth / 2}"
              y="${paddingTop}"
              width="${groupWidth}"
              height="${chartHeight}"
              data-period-index="${point.index}"
              tabindex="0"
              aria-label="${escapeHtml(`${getDirectionTimeMeta(directionState.timeMode).displayLabel} ${point.label}, inbound ${formatNumber(point.inbound)}, outbound ${formatNumber(point.outbound)}, total ${formatNumber(point.total)}`)}"
            ></rect>
            ${
              point.key === view.bestPeriod?.key
                ? renderPointBadge(point.centerX, Math.max(point.totalY - 34, 18), "Peak")
                : ""
            }
            ${
              point.key === view.worstPeriod?.key && point.key !== view.bestPeriod?.key
                ? renderPointBadge(point.centerX, Math.max(barLabelY - 18, 22), "Low")
                : ""
            }
          `;
        })
        .join("")}
      <path class="bi-total-line-shadow" d="${linePath}" fill="none" filter="url(#biLineShadow)"></path>
      <path class="bi-total-line" d="${linePath}" fill="none"></path>
      ${linePoints
        .map(
          (point) => `
            <circle
              class="bi-total-point${point.key === view.bestPeriod?.key ? " is-peak" : ""}${point.key === view.worstPeriod?.key ? " is-low" : ""}"
              cx="${point.centerX}"
              cy="${point.totalY}"
              r="${point.key === view.bestPeriod?.key || point.key === view.worstPeriod?.key ? 6 : 4}"
            ></circle>
          `,
        )
        .join("")}
      ${activeAnnotations
        .map((annotation) => {
          const point = linePoints[annotation.index];
          if (!point) {
            return "";
          }
          return renderAnnotationBadge(point.centerX, Math.max(point.totalY - 56, 18), annotation.changePct);
        })
        .join("")}
    </svg>
  `;
}

function renderPointBadge(x, y, label) {
  const width = label === "Peak" ? 42 : 34;
  return `
    <g transform="translate(${x - width / 2}, ${y})">
      <rect class="bi-point-badge" width="${width}" height="22" rx="11" ry="11"></rect>
      <text class="bi-point-badge-text" x="${width / 2}" y="15" text-anchor="middle">${escapeHtml(label)}</text>
    </g>
  `;
}

function renderAnnotationBadge(x, y, changePct) {
  const label = formatSignedPercent(changePct);
  const width = Math.max(44, label.length * 8 + 16);
  const tone = changePct > 0 ? "positive" : "negative";
  return `
    <g transform="translate(${x - width / 2}, ${y})">
      <rect class="bi-annotation-pill bi-annotation-pill-${escapeHtml(tone)}" width="${width}" height="22" rx="11" ry="11"></rect>
      <text class="bi-annotation-text" x="${width / 2}" y="15" text-anchor="middle">${escapeHtml(label)}</text>
    </g>
  `;
}

function renderDirectionInsights(view) {
  if (!view.periods.length) {
    return `<div class="empty-state">No insight cards are available for the current direction view.</div>`;
  }

  const timeMeta = getDirectionTimeMeta(directionState.timeMode);
  const averageLabel = `Average ${timeMeta.displayLabel} Volume`;
  const trendTone = view.overallTrend.tone;
  const worstValueLabel = view.worstPeriod?.label ?? "Not enough data";
  const worstContextLabel = view.worstPeriod
    ? `${formatNumber(view.worstPeriod.total ?? 0)} customers`
    : "Only one period is available in the current filter.";

  return `
    <article class="analytics-mini-card">
      <p class="mini-label">Best ${escapeHtml(timeMeta.displayLabel)}</p>
      <h3 class="mini-value">${escapeHtml(view.bestPeriod?.label ?? "--")}</h3>
      <p class="mini-copy">${escapeHtml(view.bestPeriodContext ?? `${formatNumber(view.bestPeriod?.total ?? 0)} customers`)}</p>
    </article>
    <article class="analytics-mini-card">
      <p class="mini-label">Worst ${escapeHtml(timeMeta.displayLabel)}</p>
      <h3 class="mini-value">${escapeHtml(worstValueLabel)}</h3>
      <p class="mini-copy">${escapeHtml(worstContextLabel)}</p>
    </article>
    <article class="analytics-mini-card">
      <p class="mini-label">${escapeHtml(averageLabel)}</p>
      <h3 class="mini-value">${formatNumber(view.averagePeriodVolume)}</h3>
      <p class="mini-copy">${escapeHtml(view.averagePeriodContext)}</p>
    </article>
    <article class="analytics-mini-card analytics-mini-card-${escapeHtml(trendTone)}">
      <p class="mini-label">Overall Trend</p>
      <h3 class="mini-value">${escapeHtml(view.overallTrend.label)}</h3>
      <p class="mini-copy">${escapeHtml(view.overallTrend.context)}</p>
    </article>
    ${
      view.strongestChange
        ? `
          <article class="analytics-mini-card">
            <p class="mini-label">Largest swing</p>
            <h3 class="mini-value">${escapeHtml(view.strongestChange.label)}</h3>
            <p class="mini-copy">${escapeHtml(formatSignedPercent(view.strongestChange.changePct))} vs previous ${escapeHtml(timeMeta.singular.toLowerCase())}</p>
          </article>
        `
        : ""
    }
    <article class="analytics-mini-card bi-service-pie-card">
      <div class="bi-service-pie-head">
        <p class="mini-label">All Services</p>
        <p class="mini-copy">Share of total customers by service across the current dataset.</p>
      </div>
      ${renderDirectionServicePie(view)}
    </article>
  `;
}

function renderDirectionServicePie(view) {
  const palette = ["#d61229", "#c7922b", "#22315d", "#10844e", "#ef6f51", "#6b7280", "#b45309", "#1d4ed8"];
  const rows = Array.isArray(view?.allServiceMix) ? view.allServiceMix.filter((row) => Number(row.count ?? 0) > 0) : [];
  const total = Number(view?.allServiceMixTotal ?? rows.reduce((sum, row) => sum + Number(row.count ?? 0), 0));

  if (!rows.length || !total) {
    return `<div class="empty-state">No service mix is available for the current dataset.</div>`;
  }

  const pieRows = rows.map((row, index) => ({
    ...row,
    color: palette[index % palette.length],
  }));

  let currentAngle = -Math.PI / 2;
  const radius = 82;
  const innerRadius = 42;
  const centerX = 110;
  const centerY = 110;

  const sliceMarkup = pieRows
    .map((row) => {
      const value = Number(row.count ?? 0);
      const angle = (value / total) * Math.PI * 2;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;
      const labelAngle = startAngle + angle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + innerRadius) * 0.5;
      const labelY = centerY + Math.sin(labelAngle) * (radius + innerRadius) * 0.5;
      const share = total ? value / total : 0;

      return `
        <path d="${describeDonutArc(centerX, centerY, radius, innerRadius, startAngle, endAngle)}" fill="${escapeHtml(row.color)}"></path>
        ${
          share >= 0.08
            ? `<text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" class="bi-service-pie-slice-label" text-anchor="middle" dominant-baseline="middle">${escapeHtml(formatPercentDecimal(share, 0))}</text>`
            : ""
        }
      `;
    })
    .join("");

  const legendMarkup = pieRows
    .map((row) => {
      const value = Number(row.count ?? 0);
      const share = total ? value / total : 0;
      return `
        <div class="bi-service-pie-legend-item">
          <span class="bi-service-pie-legend-swatch" style="--bi-service-pie-swatch:${escapeHtml(row.color)}"></span>
          <div class="bi-service-pie-legend-copy">
            <span class="bi-service-pie-legend-label">${escapeHtml(row.label)}</span>
            <span class="bi-service-pie-legend-meta">${formatNumber(value)} customers • ${escapeHtml(formatPercentDecimal(share, 1))}</span>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="bi-service-pie-layout">
      <div class="bi-service-pie-graphic">
        <svg class="bi-service-pie-svg" viewBox="0 0 220 220" role="img" aria-label="All services customer share pie chart">
          ${sliceMarkup}
          <circle cx="${centerX}" cy="${centerY}" r="${innerRadius}" fill="#fffaf6"></circle>
          <text x="${centerX}" y="${centerY - 6}" class="bi-service-pie-center-value" text-anchor="middle">${escapeHtml(formatNumber(total))}</text>
          <text x="${centerX}" y="${centerY + 18}" class="bi-service-pie-center-copy" text-anchor="middle">customers</text>
        </svg>
      </div>
      <div class="bi-service-pie-legend" aria-label="All services legend">
        ${legendMarkup}
      </div>
    </div>
  `;
}

function attachDirectionTooltipInteractions(view) {
  const shell = root.analytics.querySelector(".bi-chart-shell");
  const tooltip = root.analytics.querySelector("#direction-tooltip");
  if (!shell || !tooltip) {
    return;
  }

  const showTooltip = (event, index) => {
    const period = view.periods[index];
    if (!period) {
      return;
    }

    tooltip.innerHTML = renderDirectionTooltip(period);
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");

    const shellRect = shell.getBoundingClientRect();
    const targetRect =
      typeof event.currentTarget?.getBoundingClientRect === "function"
        ? event.currentTarget.getBoundingClientRect()
        : null;
    const clientX = Number.isFinite(event.clientX)
      ? event.clientX
      : targetRect
        ? targetRect.left + targetRect.width / 2
        : shellRect.left + shellRect.width / 2;
    const clientY = Number.isFinite(event.clientY)
      ? event.clientY
      : targetRect
        ? targetRect.top + targetRect.height / 3
        : shellRect.top + shellRect.height / 3;
    const tooltipRect = tooltip.getBoundingClientRect();
    let left = clientX - shellRect.left + 16;
    let top = clientY - shellRect.top - tooltipRect.height - 14;

    if (left + tooltipRect.width > shellRect.width - 12) {
      left = clientX - shellRect.left - tooltipRect.width - 16;
    }
    if (left < 12) {
      left = 12;
    }
    if (top < 12) {
      top = clientY - shellRect.top + 18;
    }
    if (top + tooltipRect.height > shellRect.height - 12) {
      top = shellRect.height - tooltipRect.height - 12;
    }

    tooltip.style.left = `${clamp(left, 12, Math.max(12, shellRect.width - tooltipRect.width - 12))}px`;
    tooltip.style.top = `${clamp(top, 12, Math.max(12, shellRect.height - tooltipRect.height - 12))}px`;
  };

  const hideTooltip = () => {
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
  };

  shell.querySelectorAll("[data-period-index]").forEach((target) => {
    const index = Number(target.getAttribute("data-period-index"));
    target.addEventListener("pointerenter", (event) => showTooltip(event, index));
    target.addEventListener("pointermove", (event) => showTooltip(event, index));
    target.addEventListener("pointerleave", hideTooltip);
    target.addEventListener("focus", (event) => showTooltip(event, index));
    target.addEventListener("blur", hideTooltip);
  });

  shell.addEventListener("pointerleave", hideTooltip);
}

function renderDirectionTooltip(period) {
  const timeMeta = getDirectionTimeMeta(directionState.timeMode);
  return `
    <p class="direction-tooltip-title">${escapeHtml(`${timeMeta.displayLabel}: ${period.label}`)}</p>
    <dl class="direction-tooltip-grid">
      <div><dt>Inbound</dt><dd>${formatNumber(period.inbound)}</dd></div>
      <div><dt>Outbound</dt><dd>${formatNumber(period.outbound)}</dd></div>
      <div><dt>Unknown</dt><dd>${formatNumber(period.unknown ?? 0)}</dd></div>
      <div><dt>Total</dt><dd>${formatNumber(period.total)}</dd></div>
      <div><dt>Change</dt><dd>${escapeHtml(formatSignedPercent(period.changePct))}</dd></div>
    </dl>
  `;
}

function deriveDirectionBiView(variant) {
  const normalizedRecords = normalizeDirectionRecords(variant);
  const datasetTotals = normalizeDirectionDatasetTotals(variant, normalizedRecords);
  const serviceOptions = Array.isArray(variant?.serviceOptions)
    ? variant.serviceOptions.filter(Boolean).map((item) => String(item))
    : [...new Set(normalizedRecords.map((record) => record.service).filter(Boolean))];
  const cacheKey = [
    variant?.key ?? "direction-month",
    directionState.timeMode,
    directionState.service,
    normalizedRecords.length,
    datasetTotals.size,
  ].join("|");

  if (directionViewCache.has(cacheKey)) {
    return directionViewCache.get(cacheKey);
  }

  const filteredRecords =
    directionState.service === "all"
      ? normalizedRecords
      : normalizedRecords.filter((record) => record.service === directionState.service);
  const monthlyPeriods = aggregateDirectionPeriods(filteredRecords, "monthly");
  const periods =
    directionState.timeMode === "monthly"
      ? monthlyPeriods
      : aggregateDirectionPeriods(filteredRecords, directionState.timeMode);
  const selectedTotals = datasetTotals.get(directionState.service) ?? datasetTotals.get("all") ?? createDirectionTotalSummary();
  const latestYear = filteredRecords.reduce((max, record) => {
    const yearValue = Number(record.yearKey || 0);
    return Number.isFinite(yearValue) ? Math.max(max, yearValue) : max;
  }, 0);
  const totalInbound = selectedTotals.inbound;
  const totalOutbound = selectedTotals.outbound;
  const totalUnknown = selectedTotals.unknown;
  const totalVolume = totalInbound + totalOutbound + totalUnknown;
  const allServiceMix = Array.from(datasetTotals.entries())
    .filter(([service]) => service !== "all")
    .map(([service, summary]) => ({
      label: service,
      count: Number(summary?.total ?? 0),
    }))
    .filter((row) => row.count > 0)
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
  const allServiceMixTotal = allServiceMix.reduce((sum, row) => sum + row.count, 0);
  const comparablePeriods = periods.filter((period) => !period.isUnknown);
  const periodScope = comparablePeriods.length ? comparablePeriods : periods;
  const bestPeriod = periodScope.reduce((best, period) => (!best || period.total > best.total ? period : best), null);
  const worstPeriod =
    periodScope.length > 1
      ? periodScope.reduce((worst, period) => (!worst || period.total < worst.total ? period : worst), null)
      : null;
  const strongestChange = periodScope
    .filter((period) => typeof period.changePct === "number")
    .reduce((strongest, period) => {
      if (!strongest || Math.abs(period.changePct) > Math.abs(strongest.changePct)) {
        return period;
      }
      return strongest;
    }, null);
  const averageDenominator = comparablePeriods.length || periodScope.length || 1;
  const averagePeriodVolume = totalVolume ? Math.round(totalVolume / averageDenominator) : 0;
  const overallTrend = describeOverallTrend(periodScope);
  const annotationThreshold = asFiniteNumber(variant?.annotationThreshold) || 0.2;
  const unknownPeriodTotal = periods.find((period) => period.isUnknown)?.total ?? 0;
  const annotations = periods
    .map((period, index) => ({ ...period, index }))
    .filter(
      (period) =>
        period.index > 0 &&
        typeof period.changePct === "number" &&
        Math.abs(period.changePct) >= annotationThreshold,
    );

  const view = {
    periods,
    serviceOptions,
    totalInbound,
    totalOutbound,
    totalUnknown,
    totalVolume,
    allServiceMix,
    allServiceMixTotal,
    latestYear: latestYear || "--",
    inboundShare: totalVolume ? totalInbound / totalVolume : 0,
    outboundShare: totalVolume ? totalOutbound / totalVolume : 0,
    scopeContextLabel: directionState.service === "all" ? "Current dataset" : `${directionState.service} service`,
    bestPeriod,
    worstPeriod,
    bestPeriodContext:
      bestPeriod && unknownPeriodTotal && !bestPeriod.isUnknown
        ? `${formatNumber(bestPeriod.total)} customers (+${formatNumber(unknownPeriodTotal)} with unknown period)`
        : `${formatNumber(bestPeriod?.total ?? 0)} customers`,
    averagePeriodVolume,
    averagePeriodContext:
      comparablePeriods.length <= 1 && directionState.timeMode === "monthly"
        ? "Average = total customers (1 month only)"
        : directionState.service === "all"
          ? "All services"
          : directionState.service,
    overallTrend,
    strongestChange,
    annotations,
    latestPeriod: periodScope.at(-1) ?? null,
    previousPeriod: periodScope.at(-2) ?? null,
  };

  directionViewCache.set(cacheKey, view);
  return view;
}

function aggregateDirectionPeriods(records, timeMode) {
  const buckets = new Map();

  records.forEach((record) => {
    const meta = getDirectionBucketMeta(record, timeMode);
    if (!meta.key) {
      return;
    }

    const existing = buckets.get(meta.key) ?? {
      key: meta.key,
      order: meta.order,
      label: meta.label,
      shortLabel: meta.shortLabel,
      isUnknown: Boolean(meta.isUnknown),
      inbound: 0,
      outbound: 0,
      unknown: 0,
      total: 0,
    };

    existing.inbound += record.inbound;
    existing.outbound += record.outbound;
    existing.unknown += record.unknown ?? 0;
    buckets.set(meta.key, existing);
  });

  const periods = [...buckets.values()]
    .sort((left, right) => {
      if (left.isUnknown !== right.isUnknown) {
        return left.isUnknown ? 1 : -1;
      }
      return String(left.order).localeCompare(String(right.order));
    })
    .map((period) => ({
      ...period,
      total: period.inbound + period.outbound + (period.unknown ?? 0),
    }));

  return periods.map((period, index) => {
    const previous = periods[index - 1];
    const previousTotal = previous?.total ?? null;
    const changePct =
      previousTotal === null || previousTotal <= 0 ? null : (period.total - previousTotal) / previousTotal;
    return {
      ...period,
      changePct,
    };
  });
}

function getDirectionBucketMeta(record, timeMode) {
  if (record.isUnknownPeriod) {
    return {
      key: `unknown-${timeMode}`,
      order: `unknown-${timeMode}`,
      label: "Unknown",
      shortLabel: "Unknown",
      isUnknown: true,
    };
  }

  if (timeMode === "quarterly") {
    return {
      key: record.quarterKey,
      order: record.quarterKey,
      label: record.quarterLabel,
      shortLabel: record.quarterShortLabel || record.quarterLabel,
      isUnknown: false,
    };
  }

  if (timeMode === "yearly") {
    return {
      key: record.yearKey,
      order: record.yearKey,
      label: record.yearLabel,
      shortLabel: record.yearLabel,
      isUnknown: false,
    };
  }

  return {
    key: record.monthKey,
    order: record.monthKey,
    label: record.monthLabel,
    shortLabel: record.monthShortLabel || record.monthLabel,
    isUnknown: false,
  };
}

function syncDirectionState(variant) {
  if (!isDirectionVariant(variant)) {
    return;
  }

  const records = normalizeDirectionRecords(variant);
  const serviceOptions = Array.isArray(variant?.serviceOptions)
    ? variant.serviceOptions.filter(Boolean).map((item) => String(item))
    : [...new Set(records.map((record) => record.service).filter(Boolean))];

  if (!["both", "inbound", "outbound"].includes(directionState.showMode)) {
    directionState.showMode = "both";
  }
  if (!["monthly", "quarterly", "yearly"].includes(directionState.timeMode)) {
    directionState.timeMode = "monthly";
  }
  if (directionState.service !== "all" && !serviceOptions.includes(directionState.service)) {
    directionState.service = "all";
  }
}

function normalizeDirectionRecords(variant) {
  if (Array.isArray(variant?.records) && variant.records.length) {
    return variant.records.map((record) => ({
      monthKey: String(record.monthKey ?? ""),
      monthLabel: String(record.monthLabel ?? record.monthKey ?? ""),
      monthShortLabel: String(record.monthShortLabel ?? record.monthLabel ?? ""),
      quarterKey: String(record.quarterKey ?? ""),
      quarterLabel: String(record.quarterLabel ?? record.quarterKey ?? ""),
      quarterShortLabel: String(record.quarterShortLabel ?? record.quarterLabel ?? ""),
      yearKey: String(record.yearKey ?? ""),
      yearLabel: String(record.yearLabel ?? record.yearKey ?? ""),
      service: String(record.service ?? "Unspecified"),
      inbound: asFiniteNumber(record.inbound),
      outbound: asFiniteNumber(record.outbound),
      unknown: asFiniteNumber(record.unknown),
      isUnknownPeriod: Boolean(record.isUnknownPeriod),
    }));
  }

  if (!Array.isArray(variant?.series)) {
    return [];
  }

  return variant.series
    .map((point, index) => createFallbackDirectionRecord(point, index))
    .filter(Boolean);
}

function createFallbackDirectionRecord(point, index) {
  const dateMeta = parseMonthLabel(String(point?.label ?? point?.shortLabel ?? ""));
  const fallbackMonth = String(index + 1).padStart(2, "0");
  const fallbackYear = "2024";
  const year = String(dateMeta?.year ?? fallbackYear);
  const month = String(dateMeta?.month ?? fallbackMonth).padStart(2, "0");
  const quarterNumber = dateMeta?.quarter ?? Math.floor(index / 3) + 1;

  return {
    monthKey: `${year}-${month}`,
    monthLabel: dateMeta?.label ?? String(point?.label ?? `Period ${index + 1}`),
    monthShortLabel: dateMeta?.shortLabel ?? String(point?.shortLabel ?? point?.label ?? `P${index + 1}`),
    quarterKey: `${year}-Q${quarterNumber}`,
    quarterLabel: `Q${quarterNumber} ${year}`,
    quarterShortLabel: `Q${quarterNumber}`,
    yearKey: year,
    yearLabel: year,
    service: "All services",
    inbound: asFiniteNumber(point?.inbound),
    outbound: asFiniteNumber(point?.outbound),
    unknown: asFiniteNumber(point?.unknown),
    isUnknownPeriod: false,
  };
}

function normalizeDirectionDatasetTotals(variant, records) {
  const totals = new Map();
  const payloadTotals = variant?.datasetTotals;

  if (payloadTotals && typeof payloadTotals === "object") {
    const overall = normalizeDirectionTotalEntry(payloadTotals.all);
    totals.set("all", overall);

    if (payloadTotals.byService && typeof payloadTotals.byService === "object") {
      Object.entries(payloadTotals.byService).forEach(([service, entry]) => {
        totals.set(String(service), normalizeDirectionTotalEntry(entry));
      });
    }
  }

  if (!totals.size) {
    const overall = createDirectionTotalSummary();
    records.forEach((record) => {
      accumulateDirectionTotal(overall, record);
      const serviceTotals = totals.get(record.service) ?? createDirectionTotalSummary();
      accumulateDirectionTotal(serviceTotals, record);
      totals.set(record.service, serviceTotals);
    });
    totals.set("all", overall);
    return totals;
  }

  if (!totals.has("all")) {
    const overall = createDirectionTotalSummary();
    Array.from(totals.entries())
      .filter(([service]) => service !== "all")
      .forEach(([, entry]) => {
        overall.inbound += entry.inbound;
        overall.outbound += entry.outbound;
        overall.unknown += entry.unknown;
      });
    overall.total = overall.inbound + overall.outbound + overall.unknown;
    totals.set("all", overall);
  }

  return totals;
}

function normalizeDirectionTotalEntry(entry) {
  const inbound = asFiniteNumber(entry?.inbound);
  const outbound = asFiniteNumber(entry?.outbound);
  const unknown = asFiniteNumber(entry?.unknown);
  return {
    inbound,
    outbound,
    unknown,
    total: inbound + outbound + unknown,
  };
}

function createDirectionTotalSummary() {
  return { inbound: 0, outbound: 0, unknown: 0, total: 0 };
}

function accumulateDirectionTotal(summary, record) {
  summary.inbound += asFiniteNumber(record?.inbound);
  summary.outbound += asFiniteNumber(record?.outbound);
  summary.unknown += asFiniteNumber(record?.unknown);
  summary.total = summary.inbound + summary.outbound + summary.unknown;
}

function parseMonthLabel(label) {
  const cleanLabel = String(label ?? "").trim();
  const monthMatch = cleanLabel.match(/^([A-Za-z]{3,9})\s+(\d{4})$/);
  if (!monthMatch) {
    return null;
  }

  const parsed = new Date(`${monthMatch[1]} 1, ${monthMatch[2]}`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const monthNumber = parsed.getMonth() + 1;
  return {
    year: parsed.getFullYear(),
    month: monthNumber,
    quarter: Math.floor((monthNumber - 1) / 3) + 1,
    label: parsed.toLocaleString("en-US", { month: "short", year: "numeric" }),
    shortLabel: parsed.toLocaleString("en-US", { month: "short" }),
  };
}

function getDirectionTimeMeta(timeMode) {
  if (timeMode === "quarterly") {
    return {
      label: "Quarterly",
      displayLabel: "Quarter",
      singular: "Quarter",
      changeTitle: "Quarter-over-quarter change",
    };
  }
  if (timeMode === "yearly") {
    return {
      label: "Yearly",
      displayLabel: "Year",
      singular: "Year",
      changeTitle: "Year-over-year change",
    };
  }
  return {
    label: "Monthly",
    displayLabel: "Month",
    singular: "Month",
    changeTitle: "Month-over-month change",
  };
}

function isDirectionVariant(variant) {
  if (!variant) {
    return false;
  }
  if (variant.key === "direction-month" || variant.chartType === "direction-bi") {
    return true;
  }
  return Array.isArray(variant.series)
    ? variant.series.some((point) => typeof point === "object" && ("inbound" in point || "outbound" in point))
    : false;
}

function describeOverallTrend(periods) {
  if (periods.length < 2) {
    return {
      label: "Stable",
      tone: "neutral",
      context: "Only one period is available in the current filter.",
    };
  }

  const first = periods[0].total;
  const last = periods.at(-1)?.total ?? 0;
  const deltaPct = first > 0 ? (last - first) / first : last > 0 ? 1 : 0;

  if (Math.abs(deltaPct) < 0.05) {
    return {
      label: "Stable",
      tone: "neutral",
      context: "Volume is moving within a narrow +/-5% range across the selected view.",
    };
  }

  if (deltaPct > 0) {
    return {
      label: "Increasing",
      tone: "positive",
      context: `${formatSignedPercent(deltaPct)} from ${periods[0].label} to ${periods.at(-1)?.label ?? periods[0].label}.`,
    };
  }

  return {
    label: "Decreasing",
    tone: "negative",
    context: `${formatSignedPercent(deltaPct)} from ${periods[0].label} to ${periods.at(-1)?.label ?? periods[0].label}.`,
  };
}

function computeNiceScale(maxValue, targetTicks = 5) {
  const safeMax = Math.max(asFiniteNumber(maxValue), 1);
  const roughStep = safeMax / Math.max(targetTicks - 1, 1);
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const residual = roughStep / magnitude;
  let niceStep = magnitude;

  if (residual > 5) {
    niceStep = 10 * magnitude;
  } else if (residual > 2) {
    niceStep = 5 * magnitude;
  } else if (residual > 1) {
    niceStep = 2 * magnitude;
  }

  const niceMax = Math.ceil(safeMax / niceStep) * niceStep;
  const ticks = [];
  for (let value = 0; value <= niceMax + niceStep / 2; value += niceStep) {
    ticks.push(value);
  }

  return { max: niceMax, ticks };
}

function createSmoothPath(points) {
  if (!points.length) {
    return "";
  }
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const previous = points[index - 1] ?? current;
    const following = points[index + 2] ?? next;
    const controlPoint1X = current.x + (next.x - previous.x) / 6;
    const controlPoint1Y = current.y + (next.y - previous.y) / 6;
    const controlPoint2X = next.x - (following.x - current.x) / 6;
    const controlPoint2Y = next.y - (following.y - current.y) / 6;
    path += ` C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${next.x} ${next.y}`;
  }
  return path;
}

function exportDirectionCsv(view) {
  if (!view?.periods?.length) {
    return;
  }

  const rows = [
    ["Period", "Inbound", "Outbound", "Unknown", "Total", "Change %", "Service filter", "Time filter"],
    ...view.periods.map((period) => [
      period.label,
      String(period.inbound),
      String(period.outbound),
      String(period.unknown ?? 0),
      String(period.total),
      typeof period.changePct === "number" ? String(Math.round(period.changePct * 100)) : "",
      directionState.service === "all" ? "All services" : directionState.service,
      getDirectionTimeMeta(directionState.timeMode).label,
    ]),
  ];

  const csvText = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\r\n");

  downloadBlob(
    new Blob([csvText], { type: "text/csv;charset=utf-8" }),
    `direction-view-${directionState.timeMode}-${basename(getActiveModePayload(dashboardData)?.meta?.sourceWorkbook ?? "dataset").replace(/\.[^.]+$/, "")}.csv`,
  );
}

function exportDirectionChartSvg() {
  const svg = root.analytics.querySelector("#direction-bi-svg");
  if (!svg) {
    return;
  }

  const styles = getComputedStyle(document.documentElement);
  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const styleNode = document.createElementNS("http://www.w3.org/2000/svg", "style");
  styleNode.textContent = `
    .chart-grid-line, .bi-grid-line { stroke: ${styles.getPropertyValue("--chart-grid").trim()}; stroke-width: 1; }
    .chart-axis-label, .bi-axis-tick, .bi-axis-label-x, .bi-axis-title { fill: ${styles.getPropertyValue("--chart-axis").trim()}; font-family: "Bahnschrift", "Trebuchet MS", "Segoe UI", sans-serif; font-size: 12px; }
    .bi-axis-line { stroke: ${styles.getPropertyValue("--line").trim()}; stroke-width: 1; }
    .bi-direction-bar-inbound { fill: ${styles.getPropertyValue("--brand").trim()}; }
    .bi-direction-bar-outbound { fill: ${styles.getPropertyValue("--highlight").trim()}; }
    .bi-total-line { stroke: ${styles.getPropertyValue("--text").trim()}; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
    .bi-total-line-shadow { stroke: rgba(30, 39, 73, 0.14); stroke-width: 8; stroke-linecap: round; stroke-linejoin: round; opacity: 0.45; }
    .bi-total-point { fill: ${styles.getPropertyValue("--text").trim()}; stroke: #ffffff; stroke-width: 2; }
    .bi-total-point.is-peak { fill: ${styles.getPropertyValue("--positive").trim()}; }
    .bi-total-point.is-low { fill: ${styles.getPropertyValue("--warning").trim()}; }
    .bi-point-badge { fill: rgba(255,255,255,0.96); stroke: ${styles.getPropertyValue("--line").trim()}; }
    .bi-point-badge-text, .bi-annotation-text, .bi-bar-value { fill: ${styles.getPropertyValue("--text").trim()}; font-family: "Bahnschrift", "Trebuchet MS", "Segoe UI", sans-serif; font-size: 11px; font-weight: 700; }
    .bi-annotation-pill-positive { fill: rgba(16, 132, 78, 0.14); stroke: rgba(16, 132, 78, 0.32); }
    .bi-annotation-pill-negative { fill: rgba(214, 18, 41, 0.12); stroke: rgba(214, 18, 41, 0.26); }
    .bi-group-band-peak { fill: rgba(16, 132, 78, 0.08); }
    .bi-group-band-low { fill: rgba(214, 18, 41, 0.07); }
  `;
  clone.prepend(styleNode);

  const serialized = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
  downloadBlob(
    new Blob([serialized], { type: "image/svg+xml;charset=utf-8" }),
    `direction-view-${directionState.timeMode}.svg`,
  );
}

function downloadBlob(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function renderAnalyticsVariant(variant) {
  if (!variant?.series?.length) {
    return `<div class="empty-state">No analytics series is available.</div>`;
  }

  if (variant.chartType === "grouped-column") {
    return renderGroupedColumnChart(variant.series);
  }

  if (variant.chartType === "column") {
    return renderColumnChart(variant.series);
  }

  return renderHorizontalBarList(variant.series, variant.unitLabel ?? "customers");
}

function renderKpis(kpis, complaintView = null) {
  if (activeMode === "complaint") {
    renderComplaintKpis(complaintView);
    return;
  }

  if (!kpis.length) {
    root.kpis.innerHTML = `<div class="empty-state">No KPI data is available yet.</div>`;
    return;
  }

  root.kpis.innerHTML = kpis
    .map(
      (kpi) => `
        <article class="kpi-card" data-tone="${escapeHtml(kpi.tone ?? "neutral")}">
          <p class="kpi-label">${escapeHtml(kpi.label)}</p>
          <h3 class="kpi-value">${escapeHtml(kpi.valueLabel ?? "--")}</h3>
          <p class="kpi-delta">${escapeHtml(kpi.contextLabel ?? "")}</p>
        </article>
      `,
    )
    .join("");
}

function renderComplaintKpis(view) {
  const safeView = view ?? deriveComplaintView(getActiveModePayload(dashboardData));
  if (!safeView) {
    root.kpis.innerHTML = `<div class="empty-state">No complaint KPI data is available yet.</div>`;
    return;
  }

  const cards = [
    {
      label: "Total Complaints",
      value: safeView.totalComplaints,
      context: "Filtered complaint rows from the raw Complaints sheet",
      tone: "neutral",
    },
    {
      label: "Close",
      value: safeView.statusCounts.Close ?? 0,
      context: safeView.availability.status ? `Unknown status: ${formatNumber(safeView.statusCounts.Unknown ?? 0)}` : "Status column not detected",
      tone: "neutral",
    },
    {
      label: "Progress",
      value: safeView.statusCounts.Progress ?? 0,
      context: safeView.availability.status ? `All status counts reconcile to ${formatNumber(safeView.totalComplaints)}` : "Status column not detected",
      tone: "neutral",
    },
    {
      label: "Complaint",
      value: safeView.feedbackCounts.Complaint ?? 0,
      context: safeView.availability.complaintFeedback
        ? `Unknown type: ${formatNumber(safeView.feedbackCounts.Unknown ?? 0)}`
        : "All complaint rows are treated as Complaint for this metric",
      tone: "neutral",
    },
    {
      label: "Feedback",
      value: safeView.feedbackCounts.Feedback ?? 0,
      context: safeView.availability.complaintFeedback
        ? `All type counts reconcile to ${formatNumber(safeView.totalComplaints)}`
        : "Data unavailable for this metric",
      tone: "neutral",
    },
    {
      label: "Critical",
      value: safeView.levelCounts.Critical ?? 0,
      context: safeView.availability.level ? `Unknown level: ${formatNumber(safeView.levelCounts.Unknown ?? 0)}` : "Complaint Level column not detected",
      tone: "accent",
    },
    {
      label: "High",
      value: safeView.levelCounts.High ?? 0,
      context: safeView.availability.level ? "Severity count from Complaint Level" : "Complaint Level column not detected",
      tone: "accent",
    },
    {
      label: "Medium",
      value: safeView.levelCounts.Medium ?? 0,
      context: safeView.availability.level ? "Severity count from Complaint Level" : "Complaint Level column not detected",
      tone: "accent",
    },
    {
      label: "Low",
      value: safeView.levelCounts.Low ?? 0,
      context: safeView.availability.level ? "Severity count from Complaint Level" : "Complaint Level column not detected",
      tone: "accent",
    },
  ];

  root.kpis.innerHTML = cards
    .map(
      (card) => `
        <article class="kpi-card" data-tone="${escapeHtml(card.tone)}">
          <p class="kpi-label">${escapeHtml(card.label)}</p>
          <h3 class="kpi-value">${formatNumber(Number(card.value ?? 0))}</h3>
          <p class="kpi-delta">${escapeHtml(card.context)}</p>
        </article>
      `,
    )
    .join("");
}

function renderTrends(trends) {
  const hourly = trends.hourlyVolume ?? [];
  const serviceMix = trends.serviceMix ?? [];
  const channelMix = trends.channelMix ?? [];
  const channelMixMeta = trends.channelMixMeta ?? {};

  root.trends.innerHTML = `
    <article class="panel chart-card">
      <div class="chart-head">
        <div>
          <p class="eyebrow">Trend</p>
          <h3>Customer volume by hour</h3>
          <p class="chart-note">Default trend view is hourly because the current workbook snapshot only spans one day.</p>
        </div>
        <span class="chip">${escapeHtml(String(hourly.length || 0))} buckets</span>
      </div>
      <div class="chart-frame">
        ${hourly.length ? renderLineChart(hourly) : `<div class="empty-state">No hourly trend data is available.</div>`}
      </div>
    </article>
    <article class="panel chart-card">
      <div class="chart-head">
        <div>
          <p class="eyebrow">Mix</p>
          <h3>Service and channel breakdown</h3>
          <p class="chart-note">Bar rows are simple placeholders for richer chart components if a UI stack is added later.</p>
        </div>
      </div>
      <div class="mix-list">
        ${serviceMix.length ? renderBarRows(serviceMix, "customers") : `<div class="empty-state">No service mix data is available.</div>`}
      </div>
      ${renderChannelMixList(channelMix, channelMixMeta)}
    </article>
  `;
}

function renderComplaintTrends(view) {
  if (!view) {
    root.trends.innerHTML = `<div class="empty-state">No complaint chart data is available yet.</div>`;
    return;
  }

  const issueChart = view.issueRows.length
    ? renderHorizontalBarList(view.issueRows.map((row) => ({ label: row.label, value: row.count })), "complaints")
    : `<div class="empty-state">No Main Issue data is available for the current filter.</div>`;
  const channelChart = !view.availability.channel
    ? `<div class="empty-state">Receiving Channels column was not detected, so channel chart is unavailable.</div>`
    : view.channelRows.length
    ? renderHorizontalBarList(view.channelRows.map((row) => ({ label: row.label, value: row.count })), "complaints")
    : `<div class="empty-state">No channel data is available for the current filter.</div>`;
  const ownerChart = !view.availability.owner
    ? `<div class="empty-state">Business Owner column was not detected, so owner chart is unavailable.</div>`
    : view.ownerRows.length
    ? renderHorizontalBarList(view.ownerRows.map((row) => ({ label: row.label, value: row.count })), "complaints")
    : `<div class="empty-state">No business owner data is available for the current filter.</div>`;
  const trendPoints = view.timeRows.map((row) => ({
    label: row.shortLabel ?? row.label,
    value: row.count,
  }));
  const trendChart = trendPoints.length
    ? trendPoints.length > 1
      ? renderLineChart(trendPoints)
      : renderColumnChart(
          trendPoints.map((point) => ({
            label: point.label,
            shortLabel: point.label,
            value: point.value,
          })),
        )
    : `<div class="empty-state">${
        view.availability.time
          ? "No complaint trend data is available for the current filter."
          : "Created and Month columns were not detected, so trend analysis is unavailable."
      }</div>`;

  root.trends.innerHTML = `
    <div class="complaint-chart-grid">
      <article class="panel chart-card complaint-chart-card complaint-chart-card-issue">
        <div class="chart-head">
          <div>
            <p class="eyebrow">Complaint chart</p>
            <h3>Complaint count by Main Issue</h3>
            <p class="chart-note">Grouped into the fixed management taxonomy and synchronized with the current complaint filter scope.</p>
          </div>
          <span class="chip">${escapeHtml(String(view.issueRows.length || 0))} groups</span>
        </div>
        <div class="chart-frame complaint-chart-issue-frame">
          <div class="complaint-chart-scroll complaint-chart-scroll-primary">${issueChart}</div>
          <div class="complaint-pie-panel">
            <div class="complaint-pie-head">
              <p class="eyebrow">Pie chart</p>
              <h4>Complaint share by Main Issue</h4>
              <p class="chart-note">The pie uses the same Main Issue counts as the bar rows above and includes labels in the legend.</p>
            </div>
            ${renderComplaintIssuePie(view.issueRows, view.totalComplaints)}
          </div>
        </div>
      </article>
      <article class="panel chart-card complaint-chart-card complaint-chart-card-owner">
        <div class="chart-head">
          <div>
            <p class="eyebrow">Complaint chart</p>
            <h3>Complaint count by Business Owner</h3>
            <p class="chart-note">Grouped from ${escapeHtml(view.fieldLabels.owner)} using the same filtered complaint scope.</p>
          </div>
          <span class="chip">${escapeHtml(String(view.ownerRows.length || 0))} groups</span>
        </div>
        <div class="chart-frame complaint-chart-scroll">${ownerChart}</div>
      </article>
      <article class="panel chart-card complaint-chart-card complaint-chart-card-trend">
        <div class="chart-head">
          <div>
            <p class="eyebrow">Complaint trend</p>
            <h3>Complaint trend over time</h3>
            <p class="chart-note">Trend buckets use Created first and fall back to Month when needed, without using Summary as a source.</p>
          </div>
          <span class="chip">${escapeHtml(String(view.timeRows.length || 0))} buckets</span>
        </div>
        <div class="chart-frame">${trendChart}</div>
      </article>
      <article class="panel chart-card complaint-chart-card complaint-chart-card-channel">
        <div class="chart-head">
          <div>
            <p class="eyebrow">Complaint chart</p>
            <h3>Complaint count by Channel</h3>
            <p class="chart-note">Grouped from ${escapeHtml(view.fieldLabels.channel)} and refreshed from the filtered Complaints rows.</p>
          </div>
          <span class="chip">${escapeHtml(String(view.channelRows.length || 0))} groups</span>
        </div>
        <div class="chart-frame complaint-chart-scroll">${channelChart}</div>
      </article>
    </div>
  `;
}

function renderComplaintIssuePie(rows = [], totalComplaints = 0) {
  const palette = ["#d61229", "#c7922b", "#1e2749", "#3f7f6e", "#e56a2f", "#8a6f3b"];
  const legendRows = rows.map((row, index) => ({
    ...row,
    color: palette[index % palette.length],
  }));
  const slices = legendRows.filter((row) => Number(row.count ?? 0) > 0);
  const total = Number(totalComplaints || slices.reduce((sum, row) => sum + Number(row.count ?? 0), 0));

  if (!total) {
    return `<div class="empty-state">No Main Issue data is available for the pie chart.</div>`;
  }

  let currentAngle = -Math.PI / 2;
  const radius = 84;
  const innerRadius = 40;
  const centerX = 110;
  const centerY = 110;

  const sliceMarkup = slices
    .map((row) => {
      const value = Number(row.count ?? 0);
      const angle = (value / total) * Math.PI * 2;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;
      const labelAngle = startAngle + angle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + innerRadius) * 0.5;
      const labelY = centerY + Math.sin(labelAngle) * (radius + innerRadius) * 0.5;
      const share = total ? value / total : 0;

      return `
        <path d="${describeDonutArc(centerX, centerY, radius, innerRadius, startAngle, endAngle)}" fill="${escapeHtml(row.color)}"></path>
        ${
          share >= 0.08
            ? `<text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" class="complaint-pie-slice-label" text-anchor="middle" dominant-baseline="middle">${escapeHtml(formatPercentDecimal(share, 0))}</text>`
            : ""
        }
      `;
    })
    .join("");

  const legendMarkup = legendRows
    .map((row) => {
      const value = Number(row.count ?? 0);
      const share = total ? value / total : 0;
      return `
        <div class="complaint-pie-legend-item${value === 0 ? " is-empty" : ""}">
          <span class="complaint-pie-legend-swatch" style="--complaint-pie-swatch:${escapeHtml(row.color)}"></span>
          <div class="complaint-pie-legend-copy">
            <span class="complaint-pie-legend-label">${escapeHtml(row.label)}</span>
            <span class="complaint-pie-legend-meta">${formatNumber(value)} complaints • ${escapeHtml(formatPercentDecimal(share, 1))}</span>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="complaint-pie-layout">
      <div class="complaint-pie-graphic">
        <svg class="complaint-pie-svg" viewBox="0 0 220 220" role="img" aria-label="Complaint share by Main Issue pie chart">
          ${sliceMarkup}
          <circle cx="${centerX}" cy="${centerY}" r="${innerRadius}" fill="#fffaf6"></circle>
          <text x="${centerX}" y="${centerY - 6}" class="complaint-pie-center-value" text-anchor="middle">${escapeHtml(formatNumber(total))}</text>
          <text x="${centerX}" y="${centerY + 18}" class="complaint-pie-center-copy" text-anchor="middle">complaints</text>
        </svg>
      </div>
      <div class="complaint-pie-legend" aria-label="Main Issue legend">
        ${legendMarkup}
      </div>
    </div>
  `;
}

function describeDonutArc(cx, cy, outerRadius, innerRadius, startAngle, endAngle) {
  if (Math.abs(endAngle - startAngle) >= Math.PI * 2 - 0.0001) {
    return [
      `M ${(cx + outerRadius).toFixed(3)} ${cy.toFixed(3)}`,
      `A ${outerRadius} ${outerRadius} 0 1 0 ${(cx - outerRadius).toFixed(3)} ${cy.toFixed(3)}`,
      `A ${outerRadius} ${outerRadius} 0 1 0 ${(cx + outerRadius).toFixed(3)} ${cy.toFixed(3)}`,
      `L ${(cx + innerRadius).toFixed(3)} ${cy.toFixed(3)}`,
      `A ${innerRadius} ${innerRadius} 0 1 1 ${(cx - innerRadius).toFixed(3)} ${cy.toFixed(3)}`,
      `A ${innerRadius} ${innerRadius} 0 1 1 ${(cx + innerRadius).toFixed(3)} ${cy.toFixed(3)}`,
      "Z",
    ].join(" ");
  }

  const startOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${startOuter.x.toFixed(3)} ${startOuter.y.toFixed(3)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${endOuter.x.toFixed(3)} ${endOuter.y.toFixed(3)}`,
    `L ${startInner.x.toFixed(3)} ${startInner.y.toFixed(3)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${endInner.x.toFixed(3)} ${endInner.y.toFixed(3)}`,
    "Z",
  ].join(" ");
}

function polarToCartesian(cx, cy, radius, angleInRadians) {
  return {
    x: cx + Math.cos(angleInRadians) * radius,
    y: cy + Math.sin(angleInRadians) * radius,
  };
}

function renderChannelMixList(channelMix, meta = {}) {
  if (!channelMix.length) {
    return `<div class="empty-state">No receiving-channel data is available.</div>`;
  }

  if (meta.isValid === false) {
    return `<div class="empty-state">${escapeHtml(meta.warningMessage ?? "Channel totals do not match total inquiries in the uploaded dataset. Please review the Receiving Channel values.")}</div>`;
  }

  return `
    <div class="channel-mix-head">
      <p class="chart-note">All values are read directly from ${escapeHtml(meta.fieldLabel ?? "Receiving Channel")} and refreshed automatically after upload.</p>
      <span class="chip">${formatNumber(Number(meta.displayedChannelCount ?? channelMix.length))} channels</span>
    </div>
    <div class="chip-row channel-chip-list" aria-label="Receiving channel breakdown">
      ${channelMix
        .map((item) => `<span class="chip">${escapeHtml(item.label)} <strong>${formatNumber(Number(item.value ?? 0))}</strong></span>`)
        .join("")}
    </div>
  `;
}

function renderCategorySummary(categoryAnalysis = {}) {
  if (!root.categorySummary) {
    return;
  }

  if (!categoryAnalysis.available) {
    root.categorySummary.innerHTML = `
      <div class="empty-state">${escapeHtml(categoryAnalysis.message ?? "Inquiry category data is not available in the current dataset.")}</div>
    `;
    return;
  }

  const view = deriveCategoryView(categoryAnalysis);
  const totals = categoryAnalysis.totals ?? {};

  root.categorySummary.innerHTML = `
    <div class="kpi-grid category-kpi-grid">
      <article class="kpi-card">
        <p class="kpi-label">Total Inquiries</p>
        <h3 class="kpi-value">${formatNumber(Number(totals.totalInquiries ?? 0))}</h3>
        <p class="kpi-delta">All inquiry rows in the current dataset</p>
      </article>
      <article class="kpi-card">
        <p class="kpi-label">Categorized Inquiries</p>
        <h3 class="kpi-value">${formatNumber(Number(totals.categorizedInquiries ?? 0))}</h3>
        <p class="kpi-delta">Rows with a named inquiry category</p>
      </article>
      <article class="kpi-card">
        <p class="kpi-label">Uncategorized Inquiries</p>
        <h3 class="kpi-value">${formatNumber(Number(totals.uncategorizedInquiries ?? 0))}</h3>
        <p class="kpi-delta">Blank, null, or whitespace-only category rows</p>
      </article>
      <article class="kpi-card" data-tone="good">
        <p class="kpi-label">Categorization Rate</p>
        <h3 class="kpi-value">${formatPercentDecimal(Number(totals.categorizationRate ?? 0), 1)}</h3>
        <p class="kpi-delta">Categorized inquiries as a share of total inquiries</p>
      </article>
    </div>
    <div class="category-toolbar">
      <label class="category-filter-group category-filter-group-select">
        <span class="bi-control-label">Service</span>
        <select id="category-service-filter" class="bi-select">
          <option value="${CATEGORY_ALL_VALUE}"${categoryState.service === CATEGORY_ALL_VALUE ? " selected" : ""}>${CATEGORY_ALL_LABEL}</option>
          ${view.serviceOptions
            .map(
              (option) => `
                <option value="${escapeHtml(option.value)}"${categoryState.service === option.value ? " selected" : ""}>
                  ${escapeHtml(option.label)}
                </option>
              `,
            )
            .join("")}
        </select>
      </label>
      <label class="category-filter-group category-filter-group-select">
        <span class="bi-control-label">Category</span>
        <select id="category-filter-select" class="bi-select">
          ${view.categoryOptions
            .map(
              (option) => `
                <option value="${escapeHtml(option.value)}"${
                  normalizeCategoryLookup(categoryState.category) === normalizeCategoryLookup(option.value)
                    ? " selected"
                    : ""
                }>
                  ${escapeHtml(option.label)}
                </option>
              `,
            )
            .join("")}
        </select>
      </label>
    </div>
    <article class="category-chart-card">
      <div class="chart-head category-chart-head">
        <div>
          <p class="eyebrow">Category analysis</p>
          <h3>Inquiry category summary</h3>
          <p class="chart-note">${escapeHtml(view.chartNote)}</p>
        </div>
        <div class="category-chart-actions">
          <span class="chip">${escapeHtml(String(view.rows.length || 0))} ${view.rows.length === 1 ? "category" : "categories"}</span>
          <button
            type="button"
            class="bi-pill bi-pill-ghost category-export-button"
            id="category-export-chart"
            ${view.rows.length ? "" : "disabled"}
          >
            Export Chart
          </button>
        </div>
      </div>
      <div class="chart-frame category-chart-frame">
        ${renderCategoryBarChart(view)}
      </div>
    </article>
    <p class="category-caption">
      Showing ${formatNumber(view.visibleInquiryCount)} inquiries across ${formatNumber(view.rows.length)} ${
        view.rows.length === 1 ? "category" : "categories"
      }. Percentages are based on ${escapeHtml(view.percentageBasisLabel)}.
    </p>
    ${
      view.rows.length
        ? `
          <div class="table-wrap category-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Category Name</th>
                  <th scope="col">Total Inquiry Count</th>
                  <th scope="col">% of Total Inquiries</th>
                </tr>
              </thead>
              <tbody>
                ${view.rows
                  .map(
                    (row) => `
                      <tr>
                        <td class="table-strong">${escapeHtml(row.category)}</td>
                        <td>${formatNumber(Number(row.count ?? 0))}</td>
                        <td>${formatPercentDecimal(Number(row.shareOfScope ?? 0), 1)}</td>
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
        : `<div class="empty-state category-empty-state">No category records found for the selected filter.</div>`
    }
  `;

  const serviceSelect = root.categorySummary.querySelector("#category-service-filter");
  serviceSelect?.addEventListener("change", () => {
    categoryState.service = serviceSelect.value || CATEGORY_ALL_VALUE;
    categoryState.category = CATEGORY_ALL_VALUE;
    renderCategorySummary(getActiveModePayload(dashboardData)?.categoryAnalysis ?? {});
  });

  const categorySelect = root.categorySummary.querySelector("#category-filter-select");
  categorySelect?.addEventListener("change", () => {
    categoryState.category = categorySelect.value || CATEGORY_ALL_VALUE;
    renderCategorySummary(getActiveModePayload(dashboardData)?.categoryAnalysis ?? {});
  });

  const exportButton = root.categorySummary.querySelector("#category-export-chart");
  exportButton?.addEventListener("click", () => {
    exportCategoryChartSvg();
  });
}

function renderComplaintSummary(view) {
  if (!root.categorySummary) {
    return;
  }

  if (!view) {
    root.categorySummary.innerHTML = `<div class="empty-state">No complaint summaries are available yet.</div>`;
    return;
  }

  root.categorySummary.innerHTML = `
    <div class="complaint-summary-grid">
      ${renderComplaintSummaryCard(
        "Complaint Level",
        `Grouped from ${view.fieldLabels.level}.`,
        view.levelRows,
        view.availability.level,
        "Complaint Level column not detected.",
      )}
      ${renderComplaintSummaryCard(
        "Gender",
        `Grouped from ${view.fieldLabels.gender}.`,
        view.genderRows,
        view.availability.gender,
        "Gender column not detected.",
      )}
      ${renderComplaintSummaryCard(
        "Business Owner",
        `Grouped from ${view.fieldLabels.owner}.`,
        view.ownerRows,
        view.availability.owner,
        "Business Owner column not detected.",
      )}
      ${renderComplaintSummaryCard(
        "Channels",
        `Grouped from ${view.fieldLabels.channel}.`,
        view.channelRows,
        view.availability.channel,
        "Receiving Channels column not detected.",
      )}
      ${renderComplaintSummaryCard(
        "Status",
        `Grouped from ${view.fieldLabels.status}.`,
        view.statusRows,
        view.availability.status,
        "Status column not detected.",
      )}
      ${renderComplaintSummaryCard(
        "Complaint vs Feedback",
        `Grouped from ${view.fieldLabels.complaintFeedback}.`,
        view.feedbackRows,
        view.availability.complaintFeedback,
        "Complaint/Feedback column not detected.",
      )}
    </div>
  `;
}

function deriveComplaintView(payload = {}) {
  const complaintModule = payload?.complaintModule ?? {};
  const records = Array.isArray(complaintModule.records) ? complaintModule.records : [];
  const availability = complaintModule.availability ?? {};
  const fieldLabels = complaintModule.fieldLabels ?? {};
  const warnings = Array.isArray(complaintModule.missingMetrics) ? [...complaintModule.missingMetrics] : [];

  const taxonomyIssues = normalizeComplaintTaxonomy(complaintModule.taxonomy);
  const issueLabels = taxonomyIssues.map((issueGroup) => issueGroup.label);
  const validIssueValues = new Set(["all", ...issueLabels]);
  if (!validIssueValues.has(complaintState.issue)) {
    complaintState.issue = "all";
  }

  const scopedTaxonomy =
    complaintState.issue === "all"
      ? taxonomyIssues
      : taxonomyIssues.filter((issueGroup) => issueGroup.label === complaintState.issue);
  const detailLabels =
    complaintState.issue === "all"
      ? taxonomyIssues.flatMap((issueGroup) => issueGroup.details)
      : scopedTaxonomy.flatMap((issueGroup) => issueGroup.details);
  const validDetailValues = new Set(["all", ...detailLabels]);
  if (!validDetailValues.has(complaintState.detail)) {
    complaintState.detail = "all";
  }

  const filteredRecords = records.filter(
    (record) =>
      (complaintState.issue === "all" || record.issue === complaintState.issue) &&
      (complaintState.detail === "all" || record.detail === complaintState.detail),
  );
  const totalComplaints = filteredRecords.length;

  const issueRows = buildComplaintFixedRows(
    filteredRecords,
    "issue",
    complaintState.issue === "all" ? issueLabels : scopedTaxonomy.map((issueGroup) => issueGroup.label),
  );
  const detailRows = buildComplaintFixedRows(filteredRecords, "detail", detailLabels);
  const statusRows = buildComplaintCountRows(filteredRecords, "status");
  const levelRows = buildComplaintCountRows(filteredRecords, "level");
  const channelRows = buildComplaintCountRows(filteredRecords, "channel");
  const ownerRows = buildComplaintCountRows(filteredRecords, "owner");
  const genderRows = buildComplaintCountRows(filteredRecords, "gender");
  let feedbackRows = buildComplaintCountRows(filteredRecords, "complaintFeedback");
  const timeRows = availability.time ? buildComplaintTimeRows(filteredRecords) : [];

  const statusCounts = complaintRowsToObject(statusRows);
  const levelCounts = complaintRowsToObject(levelRows);
  if (!availability.complaintFeedback || feedbackRows.every((row) => row.label === "Unknown")) {
    feedbackRows = buildComplaintFeedbackRows(totalComplaints);
  }
  const feedbackCounts = complaintRowsToObject(feedbackRows);
  const matrixRows = buildComplaintMatrixRows(filteredRecords, scopedTaxonomy.length ? scopedTaxonomy : taxonomyIssues);
  const detailRecords = filteredRecords
    .slice()
    .sort((left, right) => {
      const leftSort = left.createdIso || "";
      const rightSort = right.createdIso || "";
      if (leftSort !== rightSort) {
        return rightSort.localeCompare(leftSort);
      }
      return Number(right.id ?? 0) - Number(left.id ?? 0);
    })
    .slice(0, 25);

  const issueOptions = [
    { value: "all", label: "All Main Issues" },
    ...issueLabels.map((label) => ({ value: label, label })),
  ];
  const detailOptions = [
    { value: "all", label: "All Details" },
    ...detailLabels.map((label) => ({ value: label, label })),
  ];

  const validationChecks = [
    ["Main Issue", issueRows, true],
    ["Detail", detailRows, true],
    ["Status", statusRows, availability.status],
    ["Complaint Level", levelRows, availability.level],
    ["Channel", channelRows, availability.channel],
    ["Business Owner", ownerRows, availability.owner],
    ["Gender", genderRows, availability.gender],
    ["Complaint/Feedback", feedbackRows, true],
    ["Trend", timeRows, availability.time],
  ];
  validationChecks.forEach(([label, rows, enabled]) => {
    if (enabled && rows.reduce((sum, row) => sum + Number(row.count ?? 0), 0) !== totalComplaints) {
      warnings.push(`${label} totals do not reconcile to the filtered complaint total.`);
    }
  });

  return {
    availability,
    fieldLabels,
    warnings,
    totalComplaints,
    issueOptions,
    detailOptions,
    selectedIssueLabel: complaintState.issue === "all" ? "All Main Issues" : complaintState.issue,
    selectedDetailLabel: complaintState.detail === "all" ? "All Details" : complaintState.detail,
    issueScopeCount: complaintState.issue === "all" ? issueLabels.length : scopedTaxonomy.length,
    detailScopeCount: detailLabels.length,
    issueRows,
    detailRows,
    statusRows,
    levelRows,
    channelRows,
    ownerRows,
    genderRows,
    feedbackRows,
    timeRows,
    statusCounts,
    levelCounts,
    feedbackCounts,
    matrixRows,
    detailRecords,
  };
}

function normalizeComplaintTaxonomy(taxonomy = {}) {
  const issues = Array.isArray(taxonomy.issues) ? taxonomy.issues : [];
  return issues
    .map((item) => ({
      label: String(item?.label ?? "").trim(),
      details: Array.isArray(item?.details) ? item.details.map((detail) => String(detail ?? "").trim()).filter(Boolean) : [],
    }))
    .filter((item) => item.label);
}

function buildComplaintFixedRows(records, field, labels = []) {
  if (!labels.length) {
    return buildComplaintCountRows(records, field);
  }

  const counts = new Map(labels.map((label) => [label, 0]));
  records.forEach((record) => {
    const label = String(record?.[field] ?? "Unknown");
    if (counts.has(label)) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  });

  return labels.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
    share: records.length ? (counts.get(label) ?? 0) / records.length : 0,
    shortLabel: label.length > 20 ? `${label.slice(0, 20)}...` : label,
  }));
}

function buildComplaintCountRows(records, field) {
  const counts = new Map();
  records.forEach((record) => {
    const label = String(record?.[field] ?? "Unknown") || "Unknown";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([label, count]) => ({
      label,
      count,
      share: records.length ? count / records.length : 0,
      shortLabel: label.length > 12 ? `${label.slice(0, 12)}…` : label,
    }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

function buildComplaintFeedbackRows(totalComplaints) {
  return [
    {
      label: "Complaint",
      count: totalComplaints,
      share: totalComplaints ? 1 : 0,
      shortLabel: "Complaint",
    },
    {
      label: "Feedback",
      count: 0,
      share: 0,
      shortLabel: "Feedback",
    },
  ];
}

function buildComplaintTimeRows(records) {
  const buckets = new Map();
  records.forEach((record) => {
    const key = String(record?.periodKey ?? "unknown");
    const current = buckets.get(key) ?? {
      key,
      label: String(record?.periodLabel ?? "Unknown"),
      shortLabel: String(record?.periodShortLabel ?? "Unknown"),
      count: 0,
      isUnknown: Boolean(record?.isUnknownPeriod),
    };
    current.count += 1;
    buckets.set(key, current);
  });
  return Array.from(buckets.values()).sort((left, right) => {
    if (left.isUnknown !== right.isUnknown) {
      return Number(left.isUnknown) - Number(right.isUnknown);
    }
    return String(left.key).localeCompare(String(right.key));
  });
}

function complaintRowsToObject(rows) {
  return rows.reduce((accumulator, row) => {
    accumulator[row.label] = Number(row.count ?? 0);
    return accumulator;
  }, {});
}

function createComplaintMatrixAccumulator(issue, detail, isSubtotal = false) {
  return {
    issue,
    detail,
    isSubtotal,
    total: 0,
    close: 0,
    progress: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    cnb: 0,
    nbc: 0,
    customerSide: 0,
    otherBank: 0,
    thirdProcessors: 0,
    resolution: 0,
  };
}

function applyComplaintMatrixRecord(row, record) {
  row.total += 1;
  if (record.status === "Close") row.close += 1;
  if (record.status === "Progress") row.progress += 1;
  if (record.level === "Critical") row.critical += 1;
  if (record.level === "High") row.high += 1;
  if (record.level === "Medium") row.medium += 1;
  if (record.level === "Low") row.low += 1;
  if (record.sideIssueGroup === "CNB") row.cnb += 1;
  if (record.sideIssueGroup === "NBC") row.nbc += 1;
  if (record.sideIssueGroup === "Customer Side") row.customerSide += 1;
  if (record.sideIssueGroup === "Other Bank") row.otherBank += 1;
  if (record.sideIssueGroup === "3rd Processors") row.thirdProcessors += 1;
  if (String(record.resolution ?? "").trim()) row.resolution += 1;
}

function buildComplaintMatrixRows(records, taxonomyIssues = []) {
  const issueSource = taxonomyIssues.length
    ? taxonomyIssues
    : buildComplaintCountRows(records, "issue").map((issueRow) => ({
        label: issueRow.label,
        details: buildComplaintCountRows(
          records.filter((record) => record.issue === issueRow.label),
          "detail",
        ).map((detailRow) => detailRow.label),
      }));

  return issueSource.flatMap((issueGroup) => {
    const issueLabel = String(issueGroup.label ?? "Unknown");
    const issueSummary = createComplaintMatrixAccumulator(issueLabel, "All details", true);
    const detailRows = (Array.isArray(issueGroup.details) ? issueGroup.details : []).map((detailLabel) =>
      createComplaintMatrixAccumulator(issueLabel, detailLabel),
    );
    const detailLookup = new Map(detailRows.map((row) => [row.detail, row]));

    records
      .filter((record) => record.issue === issueLabel)
      .forEach((record) => {
        applyComplaintMatrixRecord(issueSummary, record);
        const detailRow = detailLookup.get(record.detail);
        if (detailRow) {
          applyComplaintMatrixRecord(detailRow, record);
        }
      });

    return [issueSummary, ...detailRows];
  });
}

function renderComplaintSummaryCard(title, note, rows, isAvailable, unavailableMessage) {
  return `
    <article class="analytics-chart-card complaint-summary-card">
      <div class="chart-head">
        <div>
          <p class="eyebrow">Summary</p>
          <h3>${escapeHtml(title)}</h3>
          <p class="chart-note">${escapeHtml(note)}</p>
        </div>
        <span class="chip">${escapeHtml(String(rows.length || 0))} groups</span>
      </div>
      ${
        isAvailable
          ? rows.length
            ? renderComplaintMiniTable(rows)
            : `<div class="empty-state">No rows are available for this summary in the current filter scope.</div>`
          : `<div class="empty-state">${escapeHtml(unavailableMessage)}</div>`
      }
    </article>
  `;
}

function renderComplaintMiniTable(rows) {
  return `
    <div class="complaint-list-scroll">
      <table class="complaint-mini-table">
        <thead>
          <tr>
            <th scope="col">Group</th>
            <th scope="col">Count</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td class="table-strong">${escapeHtml(row.label)}</td>
                  <td>${formatNumber(Number(row.count ?? 0))}</td>
                  <td>${formatPercentDecimal(Number(row.share ?? 0), 1)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function deriveCategoryView(categoryAnalysis = {}) {
  const allRows = normalizeCategoryRows(categoryAnalysis.rows);
  const validServices = new Set([CATEGORY_ALL_VALUE, ...CATEGORY_SERVICE_OPTIONS]);

  if (!validServices.has(categoryState.service)) {
    categoryState.service = CATEGORY_ALL_VALUE;
  }

  let categoryOptions = buildCategoryFilterOptions(allRows, categoryState.service);
  const validCategories = new Set(categoryOptions.map((option) => normalizeCategoryLookup(option.value)));

  if (
    categoryState.category !== CATEGORY_ALL_VALUE &&
    !validCategories.has(normalizeCategoryLookup(categoryState.category))
  ) {
    categoryState.category = CATEGORY_ALL_VALUE;
    categoryOptions = buildCategoryFilterOptions(allRows, categoryState.service);
  }

  const scopeRows =
    categoryState.service === CATEGORY_ALL_VALUE
      ? allRows
      : allRows.filter((row) => row.service === categoryState.service);
  const selectedCategoryKey = normalizeCategoryLookup(categoryState.category);
  const visibleRows =
    categoryState.category === CATEGORY_ALL_VALUE
      ? sortCategoryRows(scopeRows)
      : sortCategoryRows(scopeRows.filter((row) => row.key === selectedCategoryKey));
  const scopeTotal = scopeRows.reduce((sum, row) => sum + row.count, 0);
  const visibleInquiryCount = visibleRows.reduce((sum, row) => sum + row.count, 0);
  const percentageBase = categoryState.category === CATEGORY_ALL_VALUE ? scopeTotal : visibleInquiryCount;
  const selectedServiceLabel =
    categoryState.service === CATEGORY_ALL_VALUE ? CATEGORY_ALL_LABEL : categoryState.service;
  const selectedCategoryLabel =
    categoryState.category === CATEGORY_ALL_VALUE
      ? CATEGORY_ALL_LABEL
      : categoryOptions.find(
          (option) => normalizeCategoryLookup(option.value) === normalizeCategoryLookup(categoryState.category),
        )?.label ?? categoryState.category;
  const chartNote =
    categoryState.category === CATEGORY_ALL_VALUE
      ? categoryState.service === CATEGORY_ALL_VALUE
        ? "Showing all category counts from the inquiry dataset, including Uncategorized when it exists."
        : `Showing all mapped categories under ${selectedServiceLabel}.`
      : `Showing the selected category: ${selectedCategoryLabel}.`;
  const percentageBasisLabel =
    categoryState.category === CATEGORY_ALL_VALUE
      ? categoryState.service === CATEGORY_ALL_VALUE
        ? "all inquiries in this category section"
        : `${selectedServiceLabel} inquiries`
      : "the currently filtered scope";

  return {
    serviceOptions: CATEGORY_SERVICE_OPTIONS.map((service) => ({ value: service, label: service })),
    categoryOptions,
    rows: visibleRows.map((row) => ({
      ...row,
      shareOfScope: percentageBase ? row.count / percentageBase : 0,
    })),
    visibleInquiryCount,
    scopeTotal,
    percentageBasisLabel,
    chartNote,
    selectedServiceLabel,
    selectedCategoryLabel,
  };
}

function normalizeCategoryRows(rows = []) {
  const buckets = new Map();

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const rawLabel = String(row?.category ?? "");
    const normalizedKey = normalizeCategoryLookup(rawLabel);
    const isUncategorized =
      Boolean(row?.isUncategorized) || normalizedKey === normalizeCategoryLookup(UNCATEGORIZED_CATEGORY_LABEL);
    const category = isUncategorized
      ? UNCATEGORIZED_CATEGORY_LABEL
      : CATEGORY_CANONICAL_LABELS.get(normalizedKey) ?? rawLabel.trim();
    const key = normalizeCategoryLookup(category);
    const count = Number(row?.count ?? 0);
    if (!Number.isFinite(count) || count <= 0) {
      return;
    }

    const existing = buckets.get(key) ?? {
      category,
      key,
      count: 0,
      isUncategorized,
      service: isUncategorized ? null : CATEGORY_TO_SERVICE.get(key) ?? null,
    };
    existing.count += count;
    buckets.set(key, existing);
  });

  return Array.from(buckets.values());
}

function buildCategoryFilterOptions(allRows, serviceValue) {
  const options = [{ value: CATEGORY_ALL_VALUE, label: CATEGORY_ALL_LABEL }];
  const uncategorizedExists = allRows.some((row) => row.isUncategorized);

  if (serviceValue === CATEGORY_ALL_VALUE) {
    CATEGORY_MAPPED_ORDER.forEach((category) => {
      options.push({ value: category, label: category });
    });

    allRows
      .filter((row) => !row.isUncategorized && !row.service)
      .sort((left, right) => left.category.localeCompare(right.category))
      .forEach((row) => {
        options.push({ value: row.category, label: row.category });
      });

    if (uncategorizedExists) {
      options.push({ value: UNCATEGORIZED_CATEGORY_LABEL, label: UNCATEGORIZED_CATEGORY_LABEL });
    }

    return dedupeCategoryOptions(options);
  }

  (CATEGORY_SERVICE_GROUPS[serviceValue] ?? []).forEach((category) => {
    options.push({ value: category, label: category });
  });

  return dedupeCategoryOptions(options);
}

function dedupeCategoryOptions(options) {
  const seen = new Set();
  return options.filter((option) => {
    const key = normalizeCategoryLookup(option.value);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function sortCategoryRows(rows) {
  return [...rows].sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }
    return left.category.localeCompare(right.category);
  });
}

function renderCategoryBarChart(view) {
  if (!view.rows.length) {
    return `<div class="empty-state">No category records found for the selected filter.</div>`;
  }

  const width = 960;
  const paddingTop = 24;
  const paddingRight = 82;
  const paddingBottom = 40;
  const paddingLeft = 320;
  const rowStep = 30;
  const barHeight = 16;
  const plotWidth = width - paddingLeft - paddingRight;
  const maxValue = Math.max(...view.rows.map((row) => row.count), 1);
  const height = paddingTop + view.rows.length * rowStep + paddingBottom;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((mark) => Math.round(maxValue * mark));

  return `
    <div class="category-chart-scroll">
      <svg
        class="chart-svg category-chart-svg"
        id="category-chart-svg"
        viewBox="0 0 ${width} ${height}"
        role="img"
        aria-label="Inquiry category summary chart"
      >
        <defs>
          <linearGradient id="categoryBarGradient" x1="0" x2="1" y1="0" y2="0">
            <stop class="category-chart-stop-start" offset="0%" />
            <stop class="category-chart-stop-end" offset="100%" />
          </linearGradient>
        </defs>
        ${ticks
          .map((value) => {
            const x = paddingLeft + (value / maxValue) * plotWidth;
            return `
              <line class="category-chart-grid" x1="${x}" y1="${paddingTop - 8}" x2="${x}" y2="${height - paddingBottom + 4}"></line>
              <text class="category-chart-axis" x="${x}" y="${height - 12}" text-anchor="middle">${formatNumber(value)}</text>
            `;
          })
          .join("")}
        ${view.rows
          .map((row, index) => {
            const y = paddingTop + index * rowStep + (rowStep - barHeight) / 2;
            const barWidth = (row.count / maxValue) * plotWidth;
            return `
              <g>
                <title>${escapeHtml(row.category)}: ${formatNumber(row.count)} inquiries</title>
                <text class="category-chart-label" x="${paddingLeft - 12}" y="${y + barHeight / 2 + 4}" text-anchor="end">${escapeHtml(
                  truncateCategoryLabel(row.category),
                )}</text>
                <rect class="category-chart-track" x="${paddingLeft}" y="${y}" width="${plotWidth}" height="${barHeight}" rx="8" ry="8"></rect>
                <rect
                  class="category-chart-bar${row.isUncategorized ? " is-uncategorized" : ""}"
                  x="${paddingLeft}"
                  y="${y}"
                  width="${barWidth}"
                  height="${barHeight}"
                  rx="8"
                  ry="8"
                ></rect>
                <text class="category-chart-value" x="${width - 10}" y="${y + barHeight / 2 + 4}" text-anchor="end">${formatNumber(
                  row.count,
                )}</text>
              </g>
            `;
          })
          .join("")}
        <text class="category-chart-axis-title" x="${paddingLeft + plotWidth / 2}" y="${height - 6}" text-anchor="middle">Total Inquiry Count</text>
      </svg>
    </div>
  `;
}

function exportCategoryChartSvg() {
  const svg = root.categorySummary?.querySelector("#category-chart-svg");
  if (!svg) {
    return;
  }

  const styles = getComputedStyle(document.documentElement);
  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const styleNode = document.createElementNS("http://www.w3.org/2000/svg", "style");
  styleNode.textContent = `
    .category-chart-grid { stroke: ${styles.getPropertyValue("--chart-grid").trim()}; stroke-width: 1; }
    .category-chart-axis, .category-chart-label, .category-chart-value, .category-chart-axis-title {
      font-family: "Bahnschrift", "Trebuchet MS", "Segoe UI", sans-serif;
      font-size: 12px;
    }
    .category-chart-axis, .category-chart-axis-title { fill: ${styles.getPropertyValue("--chart-axis").trim()}; }
    .category-chart-label { fill: ${styles.getPropertyValue("--text").trim()}; font-weight: 600; }
    .category-chart-value { fill: ${styles.getPropertyValue("--muted").trim()}; font-weight: 700; }
    .category-chart-track { fill: rgba(30, 39, 73, 0.08); }
    .category-chart-stop-start { stop-color: ${styles.getPropertyValue("--brand").trim()}; }
    .category-chart-stop-end { stop-color: ${styles.getPropertyValue("--highlight").trim()}; }
    .category-chart-bar { fill: url(#categoryBarGradient); }
    .category-chart-bar.is-uncategorized { fill: rgba(30, 39, 73, 0.46); }
  `;
  clone.prepend(styleNode);

  const filenameBits = [
    "category-summary",
    slugifyFileNamePart(categoryState.service === CATEGORY_ALL_VALUE ? CATEGORY_ALL_LABEL : categoryState.service),
    slugifyFileNamePart(categoryState.category === CATEGORY_ALL_VALUE ? CATEGORY_ALL_LABEL : categoryState.category),
  ].filter(Boolean);
  const serialized = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
  downloadBlob(new Blob([serialized], { type: "image/svg+xml;charset=utf-8" }), `${filenameBits.join("-")}.svg`);
}

function normalizeCategoryLookup(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function truncateCategoryLabel(label) {
  return label.length > 34 ? `${label.slice(0, 31)}...` : label;
}

function slugifyFileNamePart(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function renderTable(table, complaintView = null) {
  if (activeMode === "complaint") {
    return renderComplaintTable(complaintView);
  }

  const rows = table.rows ?? [];

  if (!rows.length) {
    root.table.innerHTML = `
      <p class="eyebrow">Breakdown table</p>
      <h2>${escapeHtml(table.title ?? "Agent breakdown")}</h2>
      <div class="empty-state">No breakdown rows are available yet.</div>
    `;
    return;
  }

  const headers = [
    "Agent",
    "Customers",
    "Answer Rate",
    "Inbound",
    "Outbound",
    "Avg Handling",
    "Top Service",
  ];

  root.table.innerHTML = `
    <p class="eyebrow">Breakdown table</p>
    <h2>${escapeHtml(table.title ?? "Agent breakdown")}</h2>
    <p class="section-copy">${escapeHtml(table.description ?? "Rows are sorted by total customer volume.")}</p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>${headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td class="table-strong">${escapeHtml(row.agent)}</td>
                  <td>${formatNumber(row.calls)}</td>
                  <td>${formatPercent(row.answerRate)}</td>
                  <td>${formatNumber(row.inbound)}</td>
                  <td>${formatNumber(row.outbound)}</td>
                  <td>${formatMinutes(row.avgHandlingMinutes)}</td>
                  <td>${escapeHtml(row.topService)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderComplaintTable(view) {
  if (!view) {
    root.table.innerHTML = `<div class="empty-state">No complaint matrix data is available yet.</div>`;
    return;
  }

  root.table.innerHTML = `
    <p class="eyebrow">Management matrix</p>
    <h2>Complaint Matrix</h2>
    <p class="section-copy">The matrix mirrors the Summary-sheet management view with a fixed Main Issue / Detail structure, while every number is recalculated from the filtered raw Complaints rows only.</p>
    ${
      view.matrixRows.length
        ? `
          <div class="table-wrap complaint-matrix-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Main Issue</th>
                  <th scope="col">Detail</th>
                  <th scope="col">Total</th>
                  <th scope="col">Close</th>
                  <th scope="col">Progress</th>
                  <th scope="col">Critical</th>
                  <th scope="col">High</th>
                  <th scope="col">Medium</th>
                  <th scope="col">Low</th>
                  <th scope="col">CNB</th>
                  <th scope="col">NBC</th>
                  <th scope="col">Customer Side</th>
                  <th scope="col">Other Bank</th>
                  <th scope="col">3rd Processors</th>
                  ${view.availability.resolution ? '<th scope="col">Resolution</th>' : ""}
                </tr>
              </thead>
              <tbody>
                ${view.matrixRows
                  .map(
                    (row) => `
                      <tr class="${row.isSubtotal ? "complaint-matrix-total-row" : ""}">
                        <td class="table-strong">${escapeHtml(row.issue)}</td>
                        <td>${escapeHtml(row.detail)}</td>
                        <td>${formatNumber(row.total)}</td>
                        <td>${formatNumber(row.close)}</td>
                        <td>${formatNumber(row.progress)}</td>
                        <td>${formatNumber(row.critical)}</td>
                        <td>${formatNumber(row.high)}</td>
                        <td>${formatNumber(row.medium)}</td>
                        <td>${formatNumber(row.low)}</td>
                        <td>${formatNumber(row.cnb)}</td>
                        <td>${formatNumber(row.nbc)}</td>
                        <td>${formatNumber(row.customerSide)}</td>
                        <td>${formatNumber(row.otherBank)}</td>
                        <td>${formatNumber(row.thirdProcessors)}</td>
                        ${view.availability.resolution ? `<td>${formatNumber(row.resolution)}</td>` : ""}
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
        : `<div class="empty-state">No complaint records found for the selected Main Issue / Detail filter.</div>`
    }
    <div class="complaint-detail-section">
      <div class="chart-head">
        <div>
          <p class="eyebrow">Detail table</p>
          <h3>Filtered complaint records</h3>
          <p class="chart-note">Showing the latest filtered complaint rows so management can review raw detail behind the matrix counts.</p>
        </div>
        <span class="chip">${escapeHtml(String(view.detailRecords.length || 0))} rows</span>
      </div>
      ${
        view.detailRecords.length
          ? `
            <div class="table-wrap complaint-detail-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Created</th>
                    <th scope="col">Main Issue</th>
                    <th scope="col">Detail</th>
                    <th scope="col">Status</th>
                    <th scope="col">Level</th>
                    <th scope="col">Channel</th>
                    <th scope="col">Business Owner</th>
                    <th scope="col">Complaint/Feedback</th>
                    <th scope="col">Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  ${view.detailRecords
                    .map(
                      (row) => `
                        <tr>
                          <td>${escapeHtml(row.createdLabel || row.periodLabel)}</td>
                          <td class="table-strong">${escapeHtml(row.issue)}</td>
                          <td>${escapeHtml(row.detail)}</td>
                          <td>${escapeHtml(row.status)}</td>
                          <td>${escapeHtml(row.level)}</td>
                          <td>${escapeHtml(row.channel)}</td>
                          <td>${escapeHtml(row.owner)}</td>
                          <td>${escapeHtml(row.complaintFeedback)}</td>
                          <td>${escapeHtml(truncateText(row.resolution || "Unknown", 110))}</td>
                        </tr>
                      `,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
            <p class="complaint-detail-caption">Showing ${formatNumber(view.detailRecords.length)} most recent complaint rows in the current filter scope.</p>
          `
          : `<div class="empty-state">No filtered complaint records are available for the detail table.</div>`
      }
    </div>
  `;
}

function truncateText(value, maxLength = 120) {
  const text = String(value ?? "");
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function renderLineChart(points) {
  const width = 640;
  const height = 260;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const stepX = points.length > 1 ? chartWidth / (points.length - 1) : chartWidth;

  const coordinates = points.map((point, index) => {
    const x = padding + stepX * index;
    const y = padding + chartHeight - (point.value / maxValue) * chartHeight;
    return { ...point, x, y };
  });

  const polyline = coordinates.map((point) => `${point.x},${point.y}`).join(" ");
  const areaLine = `${padding},${height - padding} ${polyline} ${width - padding},${height - padding}`;

  return `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Hourly customer volume line chart">
      <defs>
        <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
          <stop class="chart-fill-start" offset="0%" />
          <stop class="chart-fill-end" offset="100%" />
        </linearGradient>
      </defs>
      ${[0, 0.25, 0.5, 0.75, 1]
        .map((mark) => {
          const y = padding + chartHeight - mark * chartHeight;
          const value = Math.round(maxValue * mark);
          return `
            <line class="chart-grid-line" x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" />
            <text class="chart-axis-label" x="${padding - 8}" y="${y + 4}" text-anchor="end" font-size="11">${value}</text>
          `;
        })
        .join("")}
      <polygon points="${areaLine}" fill="url(#lineFill)"></polygon>
      <polyline class="chart-line" points="${polyline}" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${coordinates
        .map(
          (point) => `
            <circle class="chart-point" cx="${point.x}" cy="${point.y}" r="5"></circle>
            <text class="chart-axis-label" x="${point.x}" y="${height - 8}" text-anchor="middle" font-size="11">${escapeHtml(point.label)}</text>
          `,
        )
        .join("")}
    </svg>
  `;
}

function renderColumnChart(points) {
  const width = 740;
  const height = 300;
  const paddingTop = 26;
  const paddingRight = 16;
  const paddingBottom = 54;
  const paddingLeft = 44;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const slotWidth = chartWidth / points.length;
  const barWidth = Math.min(42, slotWidth * 0.62);

  return `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Analytics column chart">
      ${[0, 0.25, 0.5, 0.75, 1]
        .map((mark) => {
          const y = paddingTop + chartHeight - mark * chartHeight;
          const value = Math.round(maxValue * mark);
          return `
            <line class="chart-grid-line" x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" />
            <text class="chart-axis-label" x="${paddingLeft - 8}" y="${y + 4}" text-anchor="end" font-size="11">${formatNumber(value)}</text>
          `;
        })
        .join("")}
      ${points
        .map((point, index) => {
          const x = paddingLeft + slotWidth * index + (slotWidth - barWidth) / 2;
          const barHeight = (point.value / maxValue) * chartHeight;
          const y = paddingTop + chartHeight - barHeight;
          return `
            <rect class="chart-bar" x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="10" ry="10"></rect>
            <text class="chart-value-label" x="${x + barWidth / 2}" y="${Math.max(y - 8, 14)}" text-anchor="middle" font-size="11">${formatNumber(point.value)}</text>
            <text class="chart-axis-label" x="${x + barWidth / 2}" y="${height - 18}" text-anchor="middle" font-size="11">${escapeHtml(point.shortLabel ?? point.label)}</text>
          `;
        })
        .join("")}
    </svg>
  `;
}

function renderGroupedColumnChart(points) {
  const width = 760;
  const height = 320;
  const paddingTop = 26;
  const paddingRight = 18;
  const paddingBottom = 54;
  const paddingLeft = 44;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxValue = Math.max(
    ...points.flatMap((point) => [Number(point.inbound ?? 0), Number(point.outbound ?? 0)]),
    1,
  );
  const groupWidth = chartWidth / points.length;
  const barWidth = Math.min(18, groupWidth * 0.25);

  return `
    <div class="analytics-chart-wrap">
      <div class="chart-legend">
        <span class="legend-item"><span class="legend-swatch legend-swatch-brand"></span>Inbound</span>
        <span class="legend-item"><span class="legend-swatch legend-swatch-highlight"></span>Outbound</span>
      </div>
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Inbound versus outbound by month chart">
        ${[0, 0.25, 0.5, 0.75, 1]
          .map((mark) => {
            const y = paddingTop + chartHeight - mark * chartHeight;
            const value = Math.round(maxValue * mark);
            return `
              <line class="chart-grid-line" x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" />
              <text class="chart-axis-label" x="${paddingLeft - 8}" y="${y + 4}" text-anchor="end" font-size="11">${formatNumber(value)}</text>
            `;
          })
          .join("")}
        ${points
          .map((point, index) => {
            const centerX = paddingLeft + groupWidth * index + groupWidth / 2;
            const inboundHeight = (Number(point.inbound ?? 0) / maxValue) * chartHeight;
            const outboundHeight = (Number(point.outbound ?? 0) / maxValue) * chartHeight;
            const inboundX = centerX - barWidth - 4;
            const outboundX = centerX + 4;
            const inboundY = paddingTop + chartHeight - inboundHeight;
            const outboundY = paddingTop + chartHeight - outboundHeight;
            return `
              <rect class="chart-bar-brand" x="${inboundX}" y="${inboundY}" width="${barWidth}" height="${inboundHeight}" rx="8" ry="8"></rect>
              <rect class="chart-bar-highlight" x="${outboundX}" y="${outboundY}" width="${barWidth}" height="${outboundHeight}" rx="8" ry="8"></rect>
              <text class="chart-axis-label" x="${centerX}" y="${height - 18}" text-anchor="middle" font-size="11">${escapeHtml(point.shortLabel ?? point.label)}</text>
            `;
          })
          .join("")}
      </svg>
    </div>
  `;
}

function renderHorizontalBarList(points, unitLabel) {
  const maxValue = Math.max(...points.map((point) => Number(point.value ?? 0)), 1);

  return `
    <div class="analytics-bar-list">
      ${points
        .map((point) => {
          const width = (Number(point.value ?? 0) / maxValue) * 100;
          return `
            <div class="analytics-bar-row">
              <div class="analytics-bar-meta">
                <span class="analytics-bar-label">${escapeHtml(point.label)}</span>
                <span class="analytics-bar-value">${formatNumber(Number(point.value ?? 0))} ${escapeHtml(unitLabel)}</span>
              </div>
              <div class="analytics-bar-track" aria-hidden="true">
                <span class="analytics-bar-fill" style="width:${width}%"></span>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderBarRows(items, unitLabel = "customers") {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return items
    .map((item) => {
      const width = (item.value / maxValue) * 100;
      return `
        <div class="mix-row">
          <span class="mix-label">${escapeHtml(item.label)}</span>
          <span class="mix-value">${formatNumber(item.value)} ${escapeHtml(unitLabel)}</span>
          <div class="mix-bar" aria-hidden="true"><span style="width:${width}%"></span></div>
        </div>
      `;
    })
    .join("");
}

function renderError(error) {
  const message = String(error?.message ?? "");
  const details = Array.isArray(error?.details) ? error.details : [];
  const isValidation = /invalid|dataset structure|upload/i.test(message);
  const title = isValidation ? "Invalid dataset format" : "Dashboard data could not be loaded";
  const copy = isValidation
    ? message || "Invalid dataset format. Please upload correct structure."
    : "The dashboard data is unavailable right now.";

  root.analytics.innerHTML = `
    <div class="error-state">
      <h3>${escapeHtml(title)}</h3>
      <p class="error-copy">${escapeHtml(copy)}</p>
      ${
        details.length
          ? `<ul class="upload-status-list">${details.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
          : `<p class="error-copy">Start the dashboard with <code>python .\\server.py</code> from the dashboard folder and refresh the page.</p>`
      }
    </div>
  `;
  root.kpis.innerHTML = "";
  root.trends.innerHTML = "";
  root.categorySummary.innerHTML = "";
  root.table.innerHTML = "";
}

function basename(path) {
  return String(path ?? "")
    .split(/[\\/]/)
    .filter(Boolean)
    .pop() ?? String(path ?? "");
}

function formatNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return value ?? "--";
  }
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercent(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return value ?? "--";
  }
  return `${Math.round(value * 100)}%`;
}

function formatPercentDecimal(value, decimals = 1) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return value ?? "--";
  }
  return `${(value * 100).toFixed(decimals)}%`;
}

function formatMinutes(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return value ?? "--";
  }
  return `${value.toFixed(1)} min`;
}

function formatSignedPercent(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }
  if (value === 0) {
    return "0%";
  }
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${Math.round(value * 100)}%`;
}

function formatRatioLabel(left, right) {
  return `${Math.round(left * 100)}% / ${Math.round(right * 100)}%`;
}

function trendArrow(value) {
  if (typeof value !== "number" || Number.isNaN(value) || value === 0) {
    return "\u2192";
  }
  return value > 0 ? "\u2191" : "\u2193";
}

function classifyTrend(value) {
  if (typeof value !== "number" || Number.isNaN(value) || value === 0) {
    return "neutral";
  }
  return value > 0 ? "positive" : "negative";
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function asFiniteNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
