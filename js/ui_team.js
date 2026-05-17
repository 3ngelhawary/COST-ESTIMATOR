// File: js/ui_team.js v40
(function () {
  const { esc } = window.UIH;

  function render(team) {
    if (!team.roles || !team.roles.length) {
      return '<div class="empty-state"><div class="es-icon">👥</div>No scope selected yet.</div>';
    }
    const rows = team.roles.map(function(r) {
      return '<tr>' +
        '<td>' + esc(r.role) + '</td>' +
        '<td class="tc">' +
          '<input class="qty-input" type="number" min="0" step="1" ' +
                 'value="' + r.qty + '" data-role="' + esc(r.role) + '">' +
        '</td>' +
      '</tr>';
    }).join('');

    return '<div class="table-wrap"><table class="t-table">' +
      '<thead><tr><th>Role</th><th class="tc" style="width:90px">Qty</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table></div>' +
    '<div class="field-note" style="margin-top:8px;">Default draftsman: 1 per 100,000 m² per discipline group.</div>';
  }

  window.UITeam = { render: render };
})();
