// File: js/ui_team.js
(function () {
  const { esc } = window.UIH;

  function render(team) {
    const rows = team.roles.map(r => `
      <tr>
        <td>${esc(r.role)}</td>
        <td class="tCenter">
          <input type="number" min="0" step="1" value="${r.qty}"
                 data-role="${esc(r.role)}"
                 style="width:72px;text-align:center;padding:4px 6px;">
        </td>
      </tr>`).join("");

    return `
      <div class="tableWrap">
        <table class="tTable">
          <thead>
            <tr>
              <th>Role</th>
              <th class="tCenter" style="width:100px">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="2" class="tCenter muted" style="padding:12px;">No active scope yet.</td></tr>`}
          </tbody>
        </table>
      </div>
      <div class="smallNote" style="margin-top:8px;">
        Draftsman default: 1 per 100,000 m² per discipline group. Edit any quantity above to override.
      </div>`;
  }

  window.UITeam = { render };
})();
