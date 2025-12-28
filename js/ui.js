// File: js/ui.js
(function () {
  const $ = (id) => document.getElementById(id);

  // Compatibility: structuredClone fallback
  function clone(obj) {
    if (typeof structuredClone === "function") return structuredClone(obj);
    return JSON.parse(JSON.stringify(obj));
  }

  // Compatibility: avoid replaceAll (some environments fail)
  function escapeHtml(str) {
    const s = String(str ?? "");
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function debug(msg) {
    const el = $("debugOut");
    if (!el) return;
    el.textContent = msg;
  }

  function safeRun(fn) {
    try {
      fn();
    } catch (e) {
      const message = (e && e.stack) ? e.stack : String(e);
      debug(message);

      // Also show something in inputs area so the page never looks "empty"
      const inputsEl = $("inputs");
      if (inputsEl) {
        inputsEl.innerHTML = `
          <div style="padding:12px;border:1px solid #243056;border-radius:12px;background:#0b1330;">
            <div style="font-weight:700;margin-bottom:6px;">UI Error</div>
            <div style="font-size:12px;opacity:.85;line-height:1.4;white-space:pre-wrap;">${escapeHtml(message)}</div>
          </div>`;
      }
    }
  }

  // Global error hooks (so blank screen never happens)
  window.addEventListener("error", (event) => {
    const msg = event?.error?.stack || event?.message || "Unknown error";
    debug(msg);
  });
  window.addEventListener("unhandledrejection", (event) => {
    const msg = event?.reason?.stack || String(event?.reason || "Unhandled rejection");
    debug(msg);
  });

  let state = clone(DEFAULT_STATE);

  function renderInputs() {
    const inputsEl = $("inputs");
    if (!inputsEl) throw new Error("Missing #inputs container in index.html");

    const requiredList = state.bimRequired
      ? APP_CONFIG.requiredDetailBim
      : APP_CONFIG.requiredDetailNonBim;

    const requiredHtml = requiredList.map((item) => {
      const checked = state.requiredDetails[item.id] ? "checked" : "";
      const sub = item.sub ? `<div class="sub">${escapeHtml(item.sub)}</div>` : "";
      return `
        <label class="checkItem">
          <input type="checkbox" data-kind="required" data-id="${escapeHtml(item.id)}" ${checked}>
          <div>
            <div class="txt">${escapeHtml(item.label)}</div>
            ${sub}
          </div>
        </label>`;
    }).join("");

    const wetHtml = APP_CONFIG.disciplines.wet.map((item) => {
      const checked = state.disciplines.wet[item.id] ? "checked" : "";
      return `
        <label class="checkItem">
          <input type="checkbox" data-kind="wet" data-id="${escapeHtml(item.id)}" ${checked}>
          <div><div class="txt">${escapeHtml(item.label)}</div></div>
        </label>`;
    }).join("");

    const dryHtml = APP_CONFIG.disciplines.dry.map((item) => {
      const checked = state.disciplines.dry[item.id] ? "checked" : "";
      return `
        <label class="checkItem">
          <input type="checkbox" data-kind="dry" data-id="${escapeHtml(item.id)}" ${checked}>
          <div><div class="txt">${escapeHtml(item.label)}</div></div>
        </label>`;
    }).join("");

    inputsEl.innerHTML = `
      <div class="row">
        <div class="field">
          <label>Project Name</label>
          <input id="projectName" type="text" placeholder="e.g., MPS02 Pump Station" value="${escapeHtml(state.projectName)}">
        </div>
        <div class="field">
          <label>Project Area (sq. m.)</label>
          <input id="projectAreaSqm" type="number" min="0" step="1" placeholder="e.g., 25000" value="${escapeHtml(String(state.projectAreaSqm))}">
          <div class="smallNote">Enter gross area (sqm). We’ll use it later for effort curves.</div>
        </div>
      </div>

      <div class="toggleRow">
        <div class="left">
          <div class="t">BIM is Required?</div>
          <div class="s">OFF → Design checklist • ON → LOD checklist</div>
        </div>
        <label class="switch" title="Toggle BIM Required">
          <input id="bimRequired" type="checkbox" ${state.bimRequired ? "checked" : ""}>
          <span class="slider"></span>
        </label>
      </div>

      <div class="groupTitle">
        <h3>Required Detail</h3>
        <span class="pill">${state.bimRequired ? "LOD Mode" : "Design Mode"}</span>
      </div>
      <div class="checkGrid">${requiredHtml}</div>

      <div class="divider"></div>

      <div class="groupTitle">
        <h3>Disciplines</h3>
        <span class="pill">Select Scope</span>
      </div>

      <div class="row">
        <div>
          <div class="groupTitle"><h3>Wet Utilities</h3><span class="pill">Wet</span></div>
          <div class="checkGrid">${wetHtml}</div>
        </div>
        <div>
          <div class="groupTitle"><h3>Dry Utilities</h3><span class="pill">Dry</span></div>
          <div class="checkGrid">${dryHtml}</div>
        </div>
      </div>
    `;

    wireInputEvents();
  }

  function wireInputEvents() {
    const nameEl = $("projectName");
    const areaEl = $("projectAreaSqm");
    const bimEl = $("bimRequired");
    const inputsEl = $("inputs");

    if (!nameEl || !areaEl || !bimEl || !inputsEl) {
      throw new Error("One or more input elements not found after render.");
    }

    nameEl.addEventListener("input", (e) => {
      state.projectName = e.target.value;
      preview();
    });

    areaEl.addEventListener("input", (e) => {
      state.projectAreaSqm = e.target.value;
      preview();
    });

    bimEl.addEventListener("change", (e) => {
      state.bimRequired = !!e.target.checked;
      renderInputs();
      preview();
    });

    inputsEl.addEventListener("change", (e) => {
      const el = e.target;
      if (!(el instanceof HTMLInputElement)) return;
      if (el.type !== "checkbox") return;

      const kind = el.getAttribute("data-kind");
      const id = el.getAttribute("data-id");
      if (!kind || !id) return;

      if (kind === "required") state.requiredDetails[id] = el.checked;
      if (kind === "wet") state.disciplines.wet[id] = el.checked;
      if (kind === "dry") state.disciplines.dry[id] = el.checked;

      preview();
    });
  }

  function preview() {
    const payload = buildInputPayload(state);
    const curEl = $("currencyOut");
    const projEl = $("projectOut");
    const jsonEl = $("jsonOut");

    if (curEl) curEl.textContent = APP_CONFIG.currencySymbol;
    if (projEl) projEl.textContent = payload.projectName ? payload.projectName : "—";
    if (jsonEl) jsonEl.textContent = JSON.stringify(payload, null, 2);
  }

  function resetAll() {
    state = clone(DEFAULT_STATE);
    renderInputs();
    preview();
    debug("No errors.");
  }

  document.addEventListener("DOMContentLoaded", () => {
    safeRun(() => {
      renderInputs();
      preview();
      debug("No errors.");

      const calcBtn = $("calcBtn");
      const resetBtn = $("resetBtn");
      if (!calcBtn || !resetBtn) throw new Error("Missing calc/reset buttons.");

      calcBtn.addEventListener("click", preview);
      resetBtn.addEventListener("click", resetAll);
    });
  });
})();
