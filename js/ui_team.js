// File: js/ui_team.js
(function () {
  const { esc } = window.UIH;

  function render(team){
    const rows = team.roles.map((r,idx)=>`
      <tr>
        <td>${esc(r.role)}</td>
        <td class="tCenter">
          <input type="number" min="0" step="1" value="${r.qty}"
                 data-role="${esc(r.role)}"
                 style="width:80px;text-align:center;">
        </td>
      </tr>
    `).join("");

    return `
      <div class="tableWrap">
        <table class="tTable">
          <thead>
            <tr><th>Role</th><th class="tCenter" style="width:120px">Qty</th></tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="2" class="tCenter muted">No active scope</td></tr>`}
          </tbody>
        </table>
      </div>
      <div class="smallNote" style="margin-top:10px;">
        Draftsman rule: <b>1 draftsman / 100,000 m²</b> for each active main discipline (editable above).
      </div>
    `;
  }

  window.UITeam = { render };
})();
