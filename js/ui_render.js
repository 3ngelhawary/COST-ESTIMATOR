// File: js/ui_render.js
(function () {
  const { $, esc, i } = window.UIH;

  function renderInputs() {
    const st = window.AppState.get();
    window.UIFacilities.normalize(st.general.architecture);
    window.UIFacilities.normalize(st.general.structure);

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

    $("inputs").innerHTML = `
      <div class="field"><label>Project Name</label><input id="projectName" type="text" value="${esc(st.projectName)}"></div>

      <div class="row">
        <div class="field"><label>Project Area (sq.m)</label><input id="projectAreaSqm" type="number" min="0" value="${esc(st.projectAreaSqm)}"></div>
        <div class="field"><label>Required Duration (Months)</label><input id="durationMonths" type="number" min="1" value="${esc(st.durationMonths)}"></div>
      </div>

      <div class="row">
        <div class="field"><label>Desired Drawing Scale</label>
          <select id="drawingScale">${window.APP_CONFIG.drawingScales.map(s=>`<option ${st.drawingScale===s?"selected":""}>${s}</option>`).join("")}</select>
        </div>

        <div class="toggleRow">
          <div class="left"><div class="t">BIM Required</div><div class="s">Switch to LOD mode</div></div>
          <label class="switch"><input id="bimRequired" type="checkbox" ${st.bimRequired?"checked":""}><span class="slider"></span></label>
        </div>
      </div>

      <div class="groupTitle"><h3>Required Detail</h3></div>
      <div class="checkGrid">${reqHtml}</div>

      <div class="divider"></div>

      <div class="row">
        <div><div class="groupTitle"><h3>Wet Utilities</h3></div><div class="checkGrid">${grid(window.APP_CONFIG.disciplines.wet,"wet",st.disciplines.wet)}</div></div>
        <div><div class="groupTitle"><h3>Dry Utilities</h3></div><div class="checkGrid">${grid(window.APP_CONFIG.disciplines.dry,"dry",st.disciplines.dry)}</div></div>
      </div>

      <div class="groupTitle"><h3>MEP</h3></div>
      <div class="checkGrid">${grid(window.APP_CONFIG.mepSystems,"mep",st.general.mep.systems)}</div>

      <div class="groupTitle"><h3>Landscape</h3></div>
      <div class="checkGrid">${grid(window.APP_CONFIG.landscapeItems,"landscape",st.general.landscape.items)}</div>

      <div class="groupTitle"><h3>Architecture</h3></div>
      <div class="row">
        <div class="field"><label>No. of Facilities</label>
          <input id="archFacilityCount" type="number" min="0" step="1" value="${esc(st.general.architecture.facilityCount)}">
          <div class="smallNote">Click "Edit Table" to enter area & floors for each facility.</div>
        </div>
        <div class="field"><label>&nbsp;</label><button type="button" class="fullWidth" id="archEditBtn">Edit Table</button></div>
      </div>

      <div class="groupTitle"><h3>Structure</h3></div>
      <div class="row">
        <div class="field"><label>No. of Facilities</label>
          <input id="strFacilityCount" type="number" min="0" step="1" value="${esc(st.general.structure.facilityCount)}">
          <div class="smallNote">Click "Edit Table" to enter area & floors for each facility.</div>
        </div>
        <div class="field"><label>&nbsp;</label><button type="button" class="fullWidth" id="strEditBtn">Edit Table</button></div>
      </div>`;
  }

  function preview() {
    const st = window.AppState.get();
    $("projectOut").textContent = st.projectName || "—";
    $("durationOut").textContent = st.durationMonths || "—";

    const team = window.UITeam.build();
    $("teamOut").innerHTML = window.UITeam.render(team);

    const payload = { ...st, output:{ teamStructure:team } };
    $("jsonOut").textContent = JSON.stringify(payload, null, 2);
  }

  window.UIRender = { renderInputs, preview };
})();
