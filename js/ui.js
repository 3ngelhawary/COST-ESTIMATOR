// File: js/ui.js
(function () {
  const $ = (id) => document.getElementById(id);
  let state = structuredClone(DEFAULT_STATE);

  function escapeHtml(str) {
    return (str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderInputs() {
    const requiredList = state.bimRequired
      ? APP_CONFIG.requiredDetailBim
      : APP_CONFIG.requiredDetailNonBim;

    const requiredHtml = requiredList
      .map((item) => {
        const checked = state.requiredDetails[item.id] ? "checked" : "";
        const sub = item.sub ? `<div class="sub">${item.sub}</div>` : "";
        return `
          <label class="checkItem">
            <input type="checkbox" data-kind="required" data-id="${item.id}" ${checked}>
            <div>
              <div class="txt">${item.label}</div>
              ${sub}
            </div>
          </label>`;
      })
      .join("");

    const wetHtml = APP_CONFIG.disciplines.wet
      .map((item) => {
        const checked = state.disciplines.wet[item.id] ? "checked" : "";
        return `
          <label class="checkItem">
            <input type="checkbox" data-kind="wet" data-id="${item.id}" ${checked}>
            <div><div class="txt">${item.label}</div></div>
          </label>`;
      })
      .join("");

    const dryHtml = APP_CONFIG.disciplines.dry
      .map((item) => {
        const checked = state.disciplines.dry[item.id] ? "checked" : "";
        return `
          <label class="checkItem">
            <input type="checkbox" data-kind="dry" data-id="${item.id}" ${checked}>
            <div><div class="txt">${item.label}</div></div>
          </label>`;
      })
      .join("");

    $("inputs").innerHTML = `
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
      <div class="checkGrid">
        ${requiredHtml}
      </div>

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
    $("projectName").addEventListener("input", (e) => {
      state.projectName = e.target.value;
      preview();
    });

    $("projectAreaSqm").addEventListener("input", (e) => {
      state.projectAreaSqm = e.target.value;
      preview();
    });

    $("bimRequired").addEventListener("change", (e) => {
      state.bimRequired = !!e.target.checked;
      renderInputs();
      preview();
    });

    $("inputs").addEventListener("change", (e) => {
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
    $("currencyOut").textContent = APP_CONFIG.currencySymbol;
    $("projectOut").textContent = payload.projectName ? payload.projectName : "—";
    $("jsonOut").textContent = JSON.stringify(payload, null, 2);
  }

  function resetAll() {
    state = structuredClone(DEFAULT_STATE);
    renderInputs();
    preview();
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderInputs();
    preview();

    $("calcBtn").addEventListener("click", preview);
    $("resetBtn").addEventListener("click", resetAll);
  });
})();
