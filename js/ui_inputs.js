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
    if (!st.roadLandscape.items) st.roadLandscape.items = {};
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
    const lenDisabled = st.lengthOverride ? "" : "disabled";

    $("inputs").innerHTML = `
      <div class="field"><label>Project Name</label><input id="projectName" type="text" value="${esc(st.projectName)}"></div>

      <div class="row">
        <div class="field"><label>Project Area (sq.m)</label><input id="projectAreaSqm" type="number" min="0" value="${esc(st.projectAreaSqm)}"></div>
        <div class="field"><label>Required Duration (Months)</label><input id="durationMonths" type="number" min="1" value="${esc(st.durationMonths)}"></div>
      </div>

      <div class="row">
        <div class="field">
          <label>Project Length (m)</label>
          <input id="projectLength" type="number" min="0" step="0.01" value="${lenVal}" ${lenDisabled}>
          <div class="smallNote">Auto length = 20% of Gross Area. Enable manual if you have exact value.</div>
          <label style="display:flex;gap:8px;align-items:center;font-size:12px;color:var(--muted);margin-top:8px;">
            <input type="checkbox" id="lengthOverride" ${st.lengthOverride?"checked":""}> Manual Length
          </label>
        </div>

        <div class="field">
          <label>Desired Drawing Scale</label>
          <select id="drawingScale">${window.APP_CONFIG.drawingScales.map(s=>`<option ${st.drawingScale===s?"selected":""}>${s}</option>`).join("")}</select>
        </div>
      </div>

      <div class="toggleRow">
        <div class="left"><div class="t">BIM Required</div><div class="s">Switch to LOD mode</div></div>
        <label class="switch"><input id="bimRequired" type="checkbox" ${st.bimRequired?"checked":""}><span class="slider"></span></label>
      </div>

      <div class="groupTitle"><h3>Required Detail</h3></div>
      <div class="checkGrid">${reqHtml}</div>

      <div class="divider"></div>

      <div class="row">
        <div><div class="groupTitle"><h3>Wet Utilities</h3></div><div class="checkGrid">${grid(window.APP_CONFIG.disciplines.wet,"wet",st.disciplines.wet)}</div></div>
        <div><div class="groupTitle"><h3>Dry Utilities</h3></div><div class="checkGrid">${grid(window.APP_CONFIG.disciplines.dry,"dry",st.disciplines.dry)}</div></div>
      </div>

      <div class="groupTitle"><h3>Road/Landscape</h3></div>
      <div class="checkGrid">${grid(window.APP_CONFIG.roadLandscapeItems,"roadLandscape",st.roadLandscape.items)}</div>

      <div class="divider"></div>

      <div class="groupTitle"><h3>Facility Information</h3></div>
      <div class="row">
        <div class="field">
          <label>Total Facility Rows</label>
          <input type="number" value="${st.facilities.length}" disabled>
          <div class="smallNote">Use the table to define facility scope (Arch/Structure/MEP) per facility type.</div>
        </div>
        <div class="field">
          <label>&nbsp;</label>
          <button type="button" class="fullWidth" id="facilityInfoBtn">Open Facility Table</button>
        </div>
      </div>
    `;
  }

  window.UIInputs = { renderInputs, autoLengthMeters, effectiveLength };
})();
