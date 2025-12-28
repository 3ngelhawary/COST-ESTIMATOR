// File: js/ui.js
(function () {
  const $ = (id) => document.getElementById(id);
  let state = JSON.parse(JSON.stringify(DEFAULT_STATE));

  function renderInputs() {
    const requiredList = state.bimRequired
      ? APP_CONFIG.requiredDetailBim
      : APP_CONFIG.requiredDetailNonBim;

    const requiredHtml = requiredList.map(item => `
      <label class="checkItem">
        <input type="checkbox" data-kind="required" data-id="${item.id}">
        <div>
          <div class="txt">${item.label}</div>
          ${item.sub ? `<div class="sub">${item.sub}</div>` : ""}
        </div>
      </label>
    `).join("");

    const renderGroup = (group, title) => `
      <div class="groupTitle"><h3>${title}</h3></div>
      <div class="checkGrid">
        ${APP_CONFIG.disciplines[group].map(d => `
          <label class="checkItem">
            <input type="checkbox" data-kind="${group}" data-id="${d}">
            <div class="txt">${d}</div>
          </label>
        `).join("")}
      </div>
    `;

    $("inputs").innerHTML = `
      <div class="field">
        <label>Project Name</label>
        <input id="projectName" type="text">
      </div>

      <div class="row">
        <div class="field">
          <label>Project Area (sq.m)</label>
          <input id="projectAreaSqm" type="number" min="0">
        </div>
        <div class="field">
          <label>Required Duration (Months)</label>
          <input id="durationMonths" type="number" min="1">
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>Desired Drawing Scale</label>
          <select id="drawingScale">
            ${APP_CONFIG.drawingScales.map(s => `<option value="${s}">${s}</option>`).join("")}
          </select>
        </div>

        <div class="toggleRow">
          <div class="left">
            <div class="t">BIM Required</div>
            <div class="s">Switch to LOD mode</div>
          </div>
          <label class="switch">
            <input id="bimRequired" type="checkbox">
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="groupTitle"><h3>Required Detail</h3></div>
      <div class="checkGrid">${requiredHtml}</div>

      <div class="divider"></div>

      ${renderGroup("general", "General Disciplines")}
      ${renderGroup("wet", "Wet Utilities")}
      ${renderGroup("dry", "Dry Utilities")}
    `;

    wireEvents();
  }

  function wireEvents() {
    $("projectName").addEventListener("input", e => {
      state.projectName = e.target.value;
      preview();
    });

    $("projectAreaSqm").addEventListener("input", e => {
      state.projectAreaSqm = e.target.value;
      preview();
    });

    $("durationMonths").addEventListener("input", e => {
      state.durationMonths = e.target.value;
      preview();
    });

    $("drawingScale").addEventListener("change", e => {
      state.drawingScale = e.target.value;
      preview();
    });

    $("bimRequired").addEventListener("change", e => {
      state.bimRequired = e.target.checked;
      renderInputs();
      preview();
    });

    $("inputs").addEventListener("change", e => {
      const el = e.target;
      if (el.type !== "checkbox") return;

      const group = el.dataset.kind;
      const id = el.dataset.id;

      if (group === "required") {
        state.requiredDetails[id] = el.checked;
      } else {
        if (!state.disciplines[group]) state.disciplines[group] = {};
        state.disciplines[group][id] = el.checked;
      }

      preview();
    });
  }

  function preview() {
    $("projectOut").textContent = state.projectName || "—";
    $("durationOut").textContent = state.durationMonths || "—";
    $("jsonOut").textContent = JSON.stringify(state, null, 2);
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderInputs();
    preview();
  });
})();
