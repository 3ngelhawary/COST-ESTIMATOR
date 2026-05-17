// File: js/ui_inputs.js v40
(function () {
  const { $, esc, f } = window.UIH;

  function autoLengthMeters(st) {
    const area = f(st.projectAreaSqm, 0);
    return area > 0 ? area * 0.20 : 0;
  }

  function effectiveLength(st) {
    if (st.lengthOverride) {
      const v = f(st.projectLengthManual, 0);
      return v > 0 ? v : 0;
    }
    return autoLengthMeters(st);
  }

  function renderInputs() {
    const st = window.AppState.get();

    if (!st.requiredDetails) st.requiredDetails = { concept:false,schematic:false,detail:false,shop:false,asbuilt:false };
    if (!st.disciplines)     st.disciplines = { wet:{}, dry:{} };
    if (!st.disciplines.wet) st.disciplines.wet = {};
    if (!st.disciplines.dry) st.disciplines.dry = {};
    if (!st.roadLandscape)   st.roadLandscape = { items:{} };
    if (!st.roadLandscape.items) st.roadLandscape.items = {};
    if (!Array.isArray(st.facilities)) st.facilities = [];
    if (!st.currencySym) st.currencySym = '$';
    if (st.overheadPct    == null) st.overheadPct    = 15;
    if (st.contingencyPct == null) st.contingencyPct = 10;

    const req = st.bimRequired ? window.APP_CONFIG.requiredDetailBim : window.APP_CONFIG.requiredDetailNonBim;

    const reqHtml = req.map(it => `
      <label class="check-item ${st.requiredDetails[it.id] ? 'is-checked' : ''}">
        <input type="checkbox" data-k="required" data-id="${it.id}" ${st.requiredDetails[it.id] ? 'checked' : ''}>
        <div>
          <div class="txt">${it.label}</div>
          ${it.sub ? `<div class="sub">${it.sub}</div>` : ''}
        </div>
      </label>`).join('');

    const grid = (arr, kind, map) => arr.map(n => `
      <label class="check-item ${map?.[n] ? 'is-checked' : ''}">
        <input type="checkbox" data-k="${kind}" data-id="${esc(n)}" ${map?.[n] ? 'checked' : ''}>
        <div class="txt">${esc(n)}</div>
      </label>`).join('');

    const autoLen = autoLengthMeters(st);
    const lenVal  = st.lengthOverride
      ? esc(st.projectLengthManual)
      : (autoLen ? String(Math.round(autoLen)) : '');

    const facCount = st.facilities.length;
    const wetOn = Object.values(st.disciplines.wet||{}).filter(v=>v).length;
    const dryOn = Object.values(st.disciplines.dry||{}).filter(v=>v).length;
    const rlOn  = Object.values(st.roadLandscape.items||{}).filter(v=>v).length;

    const currencyOpts = window.APP_CONFIG.currencies.map(c =>
      `<option value="${c.sym}" ${st.currencySym===c.sym?'selected':''}>${c.label}</option>`
    ).join('');

    const scaleOpts = window.APP_CONFIG.drawingScales.map(s =>
      `<option ${st.drawingScale===s?'selected':''}>${s}</option>`
    ).join('');

    $('inputs').innerHTML = `

      <!-- Project Info -->
      <div class="field">
        <div class="field-label">Project Name</div>
        <input id="projectName" type="text" value="${esc(st.projectName)}" placeholder="e.g. Northern Sector Infrastructure">
      </div>

      <div class="row2">
        <div class="field">
          <div class="field-label">Project Area <span class="field-hint">m²</span></div>
          <input id="projectAreaSqm" type="number" min="0" step="100" value="${esc(st.projectAreaSqm)}" placeholder="0">
          <div class="field-note">Total gross site area in square meters.</div>
        </div>
        <div class="field">
          <div class="field-label">Required Duration <span class="field-hint">months</span></div>
          <input id="durationMonths" type="number" min="1" step="1" value="${esc(st.durationMonths)}" placeholder="0">
          <div class="field-note">Client's required completion target.</div>
        </div>
      </div>

      <!-- Length -->
      <div class="field">
        <div class="field-label">
          Project Length <span class="field-hint">m</span>
          <span style="color:var(--accent-teal);font-size:10px;font-weight:400;text-transform:none;margin-left:4px;">
            ${st.lengthOverride ? 'Manual' : `Auto = ${Math.round(autoLen).toLocaleString()} m`}
          </span>
        </div>
        <input id="projectLength" type="number" min="0" step="1"
               value="${lenVal}" ${st.lengthOverride ? '' : 'disabled'}
               placeholder="${st.lengthOverride ? 'Enter exact length' : 'Auto-calculated'}">
        <label style="display:flex;gap:8px;align-items:center;margin-top:7px;cursor:pointer;">
          <input type="checkbox" id="lengthOverride" ${st.lengthOverride ? 'checked' : ''} style="accent-color:var(--focus);">
          <span style="font-size:11px;color:var(--text3);">Override with manual length</span>
        </label>
      </div>

      <!-- Scale + Currency -->
      <div class="row2">
        <div class="field">
          <div class="field-label">Drawing Scale</div>
          <select id="drawingScale">${scaleOpts}</select>
        </div>
        <div class="field">
          <div class="field-label">Currency</div>
          <select id="currencySym">${currencyOpts}</select>
        </div>
      </div>

      <!-- BIM Toggle -->
      <div class="toggle-row">
        <div>
          <div class="t-label">Workflow Mode</div>
          <div class="t-sub">${st.bimRequired ? 'BIM — LOD phases (100–500)' : 'CAD — Traditional phases'}</div>
        </div>
        <label class="switch">
          <input id="bimRequired" type="checkbox" ${st.bimRequired ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>

      <!-- Phases -->
      <div class="sec-label">Included Phases</div>
      <div class="check-grid">${reqHtml}</div>

      <div class="divider"></div>

      <!-- Wet + Dry -->
      <div class="row2">
        <div>
          <div class="sec-label">Wet Utilities <span style="color:var(--accent-teal);font-family:var(--font-mono);font-size:10px;margin-left:4px;">${wetOn}/${window.APP_CONFIG.disciplines.wet.length}</span></div>
          <div class="check-grid">${grid(window.APP_CONFIG.disciplines.wet,'wet',st.disciplines.wet)}</div>
        </div>
        <div>
          <div class="sec-label">Dry Utilities <span style="color:var(--accent-teal);font-family:var(--font-mono);font-size:10px;margin-left:4px;">${dryOn}/${window.APP_CONFIG.disciplines.dry.length}</span></div>
          <div class="check-grid">${grid(window.APP_CONFIG.disciplines.dry,'dry',st.disciplines.dry)}</div>
        </div>
      </div>

      <!-- Road/Landscape -->
      <div class="sec-label">Road / Landscape <span style="color:var(--accent-teal);font-family:var(--font-mono);font-size:10px;margin-left:4px;">${rlOn}/${window.APP_CONFIG.roadLandscapeItems.length}</span></div>
      <div class="check-grid">${grid(window.APP_CONFIG.roadLandscapeItems,'roadLandscape',st.roadLandscape.items)}</div>

      <div class="divider"></div>

      <!-- Facilities -->
      <div class="sec-label">Facility Information <span style="color:var(--accent-teal);font-family:var(--font-mono);font-size:10px;margin-left:4px;">${facCount} row${facCount!==1?'s':''}</span></div>
      <button type="button" class="btn btn--full" id="facilityInfoBtn">
        <svg viewBox="0 0 16 16" fill="none" style="width:14px;height:14px;"><rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M5 8h6M8 5v6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        Open Facility Table ${facCount ? `(${facCount} row${facCount>1?'s':''})` : ''}
      </button>
    `;
  }

  window.UIInputs = { renderInputs, autoLengthMeters, effectiveLength };
})();
