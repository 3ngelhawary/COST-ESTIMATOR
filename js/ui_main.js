// File: js/ui_main.js v40
(function () {
  const { $ } = window.UIH;

  // ── Collapsible sections ─────────────────────────────────────────────────
  function initCollapsibles() {
    document.querySelectorAll('.os-header[data-toggle]').forEach(function(hdr) {
      hdr.addEventListener('click', function() {
        const secId = hdr.getAttribute('data-toggle');
        const sec   = document.getElementById(secId);
        if (sec) sec.classList.toggle('collapsed');
      });
    });
  }

  // ── Input event wiring ───────────────────────────────────────────────────
  function bind() {
    const st = window.AppState.get();

    const wire = function(id, setter, reset) {
      const el = document.getElementById(id);
      if (!el) return;
      el.oninput = function(e) {
        setter(e.target.value);
        if (reset) { st.teamOverrides = {}; st._juniorManual = false; st.autoJuniorLevel = 1; }
        window.UIRender.preview();
      };
    };

    wire('projectName',    function(v){ st.projectName    = v; });
    wire('projectAreaSqm', function(v){ st.projectAreaSqm = v; }, true);
    wire('durationMonths', function(v){ st.durationMonths = v; });
    wire('drawingScale',   function(v){ st.drawingScale   = v; });
    wire('currencySym',    function(v){ st.currencySym    = v; });

    const projLen = document.getElementById('projectLength');
    if (projLen) projLen.oninput = function(e) { st.projectLengthManual = e.target.value; window.UIRender.preview(); };

    const lenOv = document.getElementById('lengthOverride');
    if (lenOv) lenOv.onchange = function(e) {
      st.lengthOverride = !!e.target.checked;
      requestAnimationFrame(function() { window.UIRender.renderInputs(); bind(); window.UIRender.preview(); });
    };

    const bim = document.getElementById('bimRequired');
    if (bim) bim.onchange = function(e) {
      st.bimRequired = !!e.target.checked;
      st.teamOverrides = {}; st._juniorManual = false; st.autoJuniorLevel = 1;
      requestAnimationFrame(function() { window.UIRender.renderInputs(); bind(); window.UIRender.preview(); });
    };

    const facBtn = document.getElementById('facilityInfoBtn');
    if (facBtn) facBtn.onclick = function() { window.UIFacilityInfo.openFacilityTable(); };

    // Delegated checkbox handler (phases, disciplines, road/landscape)
    const inputsDiv = document.getElementById('inputs');
    if (inputsDiv) {
      inputsDiv.onchange = function(e) {
        const el = e.target;
        if (!(el instanceof HTMLInputElement) || el.type !== 'checkbox') return;
        const k  = el.dataset.k;
        const id = el.dataset.id;
        if (!k || !id) return;

        // Scope change → full team reset
        st.teamOverrides = {}; st._juniorManual = false; st.autoJuniorLevel = 1;

        if      (k === 'required')      st.requiredDetails[id]     = el.checked;
        else if (k === 'wet')           st.disciplines.wet[id]     = el.checked;
        else if (k === 'dry')           st.disciplines.dry[id]     = el.checked;
        else if (k === 'roadLandscape') st.roadLandscape.items[id] = el.checked;

        // Keep visual checked state
        const label = el.closest('.check-item');
        if (label) label.classList.toggle('is-checked', el.checked);

        window.UIRender.preview();
      };
    }
  }

  // ── CSV Export ───────────────────────────────────────────────────────────
  function exportCSV() {
    const st   = window.AppState.get();
    const team = window.TeamModel.build(st);
    const res  = window.RatesEngine.compute(st);
    const dur  = res.projectDuration || 0;
    const dm   = window.DrawingsEngine.compute(st);
    const pricing = window.PricingEngine.compute(
      team.roles, dur,
      st.avgManHourCost, st.overheadPct, st.contingencyPct
    );
    const sym = st.currencySym || '$';
    const len = window.UIInputs.effectiveLength(st);
    const fmtN = function(n, d) { return Number.isFinite(n) ? n.toFixed(d == null ? 2 : d) : '0'; };

    const lines = [];
    const add = function() { lines.push(Array.prototype.slice.call(arguments).map(function(c){ return '"'+String(c).replace(/"/g,'""')+'"'; }).join(',')); };

    add('Design Cost Estimator — Export');
    add('Project Name', st.projectName || '');
    add('Project Area (m²)', st.projectAreaSqm || '');
    add('Project Length (m)', fmtN(len, 0));
    add('Workflow', st.bimRequired ? 'BIM' : 'CAD');
    add('Drawing Scale', st.drawingScale || '');
    add('Currency', sym);
    add('');

    add('=== DURATION BREAKDOWN ===');
    add('Work Stream','Qty','Unit','Engineers','Duration (mo.)');
    res.rows.forEach(function(r){ add(r.label, fmtN(r.qty,2), r.unit, fmtN(r.eng,2), fmtN(r.dur,2)); });
    add('PROJECT DURATION (critical path)','','','', fmtN(dur,2));
    add('');

    add('=== DRAWINGS ===');
    add('Plan Sheets', dm.totalPlans);
    add('Profile Sheets', dm.totalProfiles);
    add('Detail Drawings', dm.totalDetails);
    add('Total Drawings', dm.totalDrawings);
    add('');

    add('=== TEAM & COST ===');
    add('Role','Qty','MH/Month',sym+'/Month','Total '+sym);
    pricing.rows.forEach(function(r){
      add(r.role, r.qty, fmtN(r.mhPerMonth,0), fmtN(r.costPerMonth,2), fmtN(r.total,2));
    });
    add('');
    add('Direct Labor','','','', fmtN(pricing.directCost,2));
    add('Overhead ('+fmtN(pricing.overheadPct,0)+'%)','','','', fmtN(pricing.overhead,2));
    add('Subtotal','','','', fmtN(pricing.subtotal,2));
    add('Contingency ('+fmtN(pricing.contingencyPct,0)+'%)','','','', fmtN(pricing.contingency,2));
    add('GRAND TOTAL','','','', fmtN(pricing.grandTotal,2));

    const csv  = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = (st.projectName || 'project').replace(/\s+/g,'-') + '-cost-estimate.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  // ── Boot ─────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    window.UIRender.renderInputs();
    bind();
    initCollapsibles();
    window.UIRender.preview();

    // Export CSV
    const csvBtn = document.getElementById('exportCsvBtn');
    if (csvBtn) csvBtn.onclick = exportCSV;

    // Print
    const pBtn = document.getElementById('printBtn');
    if (pBtn) pBtn.onclick = function() { window.print(); };

    // Reset
    const rBtn = document.getElementById('resetBtn');
    if (rBtn) rBtn.onclick = function() {
      if (!confirm('Reset all data? This cannot be undone.')) return;
      window.AppState.reset();
      window.UIRender.renderInputs();
      bind();
      window.UIRender.preview();
    };

    // Modal close keys
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') window.UIModal.hide();
    });
  });
})();
