// File: js/ui_inputs.js
(function () {
  const { $, esc, f } = window.UIH;

  function autoLengthMeters(st){
    const area = f(st.projectAreaSqm, 0);
    return area > 0 ? area * 0.20 : 0;
  }
  function effectiveLength(st){
    if (st.lengthOverride) {
      const v = f(st.projectLengthManual, 0);
      return v > 0 ? v : 0;
    }
    return autoLengthMeters(st);
  }

  function renderInputs() {
    const st = window.AppState.get();
    if (!st.roadLandscape) st.roadLandscape = { items:{} };
    if (!Array.isArray(st.facilities)) st.facilities = [];

    const req = st.bimRequired ? window.APP_CONFIG.requiredDetailBim : window.APP_CONFIG.requiredDetailNonBim;
    const reqHtml = req.map(it=>`
      <label class="checkItem">
        <input type="checkbox" data-k="required" data-id="${it.id}" ${st.requiredDetails[it.id]?"checked":""}>
        <div><div class="txt">${it.label}</div>${it.sub?`<div class="sub">${it.sub}</div>`:""}</div>
      </label>`).join("");

    const grid = (arr, kind, map)=>arr.map(n=>`
      <label class="checkItem">
        <input type="checkbox" data-k="${kind}" data-id="${esc(n)}" ${map?.[n]?"checked":""}>
        <div class="txt">${esc(n)}</div>
      </label>`).join("");

    const autoLen = autoLengthMeters(st);
    const lenVal = st.lengthOverride ? esc(st.projectLengthManual) : (autoLen ? String(Math.round(autoLen*100)/100) : "");

    // duration shown as read-only (calculated)
    const calcDur = (st.calculatedDurationMonths!=null) ? String(st.calculatedDurationMonths) : "";

    $("inputs").innerHTML = `
      <div class="field"><label>Project Name</label><input id="projectName" type="text" value="${esc(st.projectName)}"></div>

      <div class="row">
        <div class="field"><label>Project Area (m²)</label><input id="projectAreaSqm" type="number" min="0" value="${esc(st.projectAreaSqm)}"></div>
        <div class="field"><label>Calculated Duration (Months)</label><input id="durationMonths" type="number" value="${esc(calcDur)}" disabled></div>
      </div>

      <div class="row">
        <div class="field">
          <label>Project Length (m)</label>
          <input id="projectLength" type="number" min="0" step="0.01" value="${lenVal}" ${st.lengthOverride?"":"disabled"}>
          <label style="display:flex;gap:8px;font-size:12px;margin-top:6px;color:var(--muted);">
            <input type="checkbox" id="lengthOverride" ${st.lengthOverride?"checked":""}> Manual Length
          </label>
        </div>
        <div class="field">
          <label>Desired Drawing Scale</label>
          <select id="drawingScale">${window.APP_CONFIG.drawingScales.map(s=>`<option ${st.drawingScale===s?"selected":""}>${s}</option>`).join("")}</select>
        </div>
      </div>

      <div class="toggleRow">
        <div class="left"><div class="t">Workflow</div><div class="s">${st.bimRequired?"BIM":"CAD"}</div></div>
        <label class="switch"><input id="bimRequired" type="checkbox" ${st.bimRequired?"checked":""}><span class="slider"></span></label>
      </div>

      <div class="groupTitle"><h3>Included Phases</h3></div>
      <div class="checkGrid">${reqHtml}</div>

      <div class="divider"></div>

      <div class="row">
        <div><div class="groupTitle"><h3>Wet Utilities</h3></div><div class="checkGrid">${grid(window.APP_CONFIG.disciplines.wet,"wet",st.disciplines.wet)}</div></div>
        <div><div class="groupTitle"><h3>Dry Utilities</h3></div><div class="checkGrid">${grid(window.APP_CONFIG.disciplines.dry,"dry",st.disciplines.dry)}</div></div>
      </div>

      <div class="groupTitle"><h3>Road / Landscape</h3></div>
      <div class="checkGrid">${grid(window.APP_CONFIG.roadLandscapeItems,"roadLandscape",st.roadLandscape.items)}</div>

      <div class="divider"></div>

      <div class="groupTitle"><h3>Facility Information</h3></div>
      <button type="button" class="fullWidth" id="facilityInfoBtn">Open Facility Table</button>
    `;
  }

  window.UIInputs = { renderInputs, autoLengthMeters, effectiveLength };
})();
