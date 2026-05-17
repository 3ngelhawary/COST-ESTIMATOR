// File: js/ui_drawings.js v40
(function () {
  const { esc } = window.UIH;
  function fmtInt(n) { return Number.isFinite(n) ? Math.round(n).toLocaleString('en-US') : '0'; }

  function render(m) {
    if (!m.activeDisciplineGroups) {
      return '<div class="empty-state"><div class="es-icon">📐</div>Select disciplines to estimate drawings.</div>';
    }
    return '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">' +
      '<div class="kpi-card kpi-card--blue">' +
        '<div class="kpi-label">Scale</div>' +
        '<div class="kpi-value" style="font-size:14px;">' + esc(m.scale) + '</div>' +
      '</div>' +
      '<div class="kpi-card kpi-card--teal">' +
        '<div class="kpi-label">Disc. Groups</div>' +
        '<div class="kpi-value" style="font-size:18px;">' + m.activeDisciplineGroups + '</div>' +
      '</div>' +
      '<div class="kpi-card kpi-card--amber">' +
        '<div class="kpi-label">Total Sheets</div>' +
        '<div class="kpi-value mono" style="font-size:18px;">' + fmtInt(m.totalDrawings) + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="table-wrap"><table class="t-table">' +
      '<thead><tr>' +
        '<th>Type</th>' +
        '<th class="tc" style="width:200px">Basis</th>' +
        '<th class="tc" style="width:80px">Sheets</th>' +
      '</tr></thead>' +
      '<tbody>' +
        '<tr><td><b>Plan Sheets</b></td>' +
          '<td class="tc">' + m.plansPerGroup + ' / group × ' + m.activeDisciplineGroups + ' groups</td>' +
          '<td class="tc mono"><b>' + fmtInt(m.totalPlans) + '</b></td></tr>' +
        '<tr><td style="padding-left:18px;color:var(--text3);">— Per group</td>' +
          '<td class="tc">Main @ ' + esc(m.scale) + ' + Fac @ 1:100</td>' +
          '<td class="tc mono">' + m.plansPerGroup + '</td></tr>' +
        '<tr><td><b>Profile Sheets</b></td>' +
          '<td class="tc">Base × ' + m.profileStreams + ' stream(s)</td>' +
          '<td class="tc mono"><b>' + fmtInt(m.totalProfiles) + '</b></td></tr>' +
        '<tr><td style="padding-left:18px;color:var(--text3);">— Base sheets</td>' +
          '<td class="tc">' + m.profileBase + ' (per 1,000 m)</td>' +
          '<td class="tc mono"></td></tr>' +
        '<tr><td><b>Detail Drawings</b></td>' +
          '<td class="tc">10 per discipline group</td>' +
          '<td class="tc mono"><b>' + fmtInt(m.totalDetails) + '</b></td></tr>' +
        '<tr class="t-total"><td><b>Total</b></td>' +
          '<td class="tc">Plans + Profiles + Details</td>' +
          '<td class="tc mono"><b>' + fmtInt(m.totalDrawings) + '</b></td></tr>' +
      '</tbody>' +
    '</table></div>' +
    (m.grid.rows > 0
      ? '<div class="field-note" style="margin-top:8px;">Suggested sheet grid (main plans): <b>' + m.grid.rows + ' rows × ' + m.grid.cols + ' cols</b></div>'
      : '');
  }

  window.UIDrawings = { render: render };
})();
