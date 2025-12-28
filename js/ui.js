// File: js/ui.js
(function () {
  const $ = (id) => document.getElementById(id);
  let state = JSON.parse(JSON.stringify(window.DEFAULT_STATE));

  function renderInputs() {
    const requiredList = state.bimRequired
      ? window.APP_CONFIG.requiredDetailBim
      : window.APP_CONFIG.requiredDetailNonBim;

    const requiredHtml = requiredList.map(item => {
      const checked = state.requiredDetails[item.id] ? "checked" : "";
      return `
        <label class="checkItem">
          <input type="checkbox" data-kind="required" data-id="${item.id}" ${checked}>
          <div>
            <div class="txt">${item.label}</div>
            ${item.sub ? `<div class="sub">${item.sub}</div>` : ""}
          </div>
        </label>
      `;
    }).join("");

    const renderGroup = (group, title) => `
      <div class="groupTitle"><h3>${title}</h3></div>
      <div class="checkGrid">
        ${window.APP_CONFIG.disciplines[group].map(d => {
          const checked = state.disciplines[group]?.[d] ? "checked" : "";
          return `
            <label class="checkItem">
              <input type="checkbox" data-kind="${group}" data-id="${d}" ${checked}>
              <div class="txt">${d}</div>
            </label>
          `;
        }).join("")}
      </div>
    `;

    $("inputs").innerHTML = `
      <div class="field">
        <label>Project Name</label>
        <input id="projectName" type="text" value="${escapeAttr(state.projectName)}">
      </div>

      <div class="row">
        <div class="field">
          <label>Project Area (sq.m)</label>
          <input id="projectAreaSqm" type="number" min="0" value="${escapeAttr(state.projectAreaSqm)}">
        </div>
        <div class="field">
          <label>Required Duration (Months)</label>
          <input id="durationMonths" type="number" min="1" value="${escapeAttr(state.durationMonths)}">
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>Desired Drawing Scale</label>
          <select id="drawingScale">
            ${window.APP_CONFIG.drawingScales.map(s =>
              `<option value="${escapeAttr(s)}" ${state.drawingScale === s ? "selected" : ""}>${s}</option>`
            ).join("")}
          </select>
        </div>

        <div class="toggleRow">
          <div class="left">
            <div class="t">BIM Required</div>
            <div class="s">Switch to LOD mode</div>
          </div>
          <label class="switch">
            <input id="bimRequired" type="checkbox" ${state.bimRequired ? "checked" : ""}>
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
    $("projectName").oninput = e => {
      state.projectName = e.target.value;
      preview();
    };

    $("projectAreaSqm").oninput = e => {
      state.projectAreaSqm = e.target.value;
      preview();
    };

    $("durationMonths").oninput = e => {
      state.durationMonths = e.target.value;
      preview();
    };

    $("drawingScale").onchange = e => {
      state.drawingScale = e.target.value;
      preview();
    };

    // ✅ FIX: defer re-render to next tick to avoid "stuck ON" behavior
    $("bimRequired").onchange = e => {
      const value = e.target.checked;
      state.bimRequired = value;

      requestAnimationFrame(() => {
        renderInputs();
        preview();
      });
    };

    $("inputs").onchange = e => {
      const el = e.target;
      if (!(el instanceof HTMLInputElement)) return;
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
    };
  }

  function preview() {
    const projectOut = $("projectOut");
    const durationOut = $("durationOut");
    const jsonOut = $("jsonOut");

    if (projectOut) projectOut.textContent = state.projectName || "—";
    if (durationOut) durationOut.textContent = state.durationMonths || "—";
    if (jsonOut) jsonOut.textContent = JSON.stringify(state, null, 2);
  }

  // Minimal safe escaping for attribute values
  function escapeAttr(v) {
    const s = String(v ?? "");
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderInputs();
    preview();
  });
})();
