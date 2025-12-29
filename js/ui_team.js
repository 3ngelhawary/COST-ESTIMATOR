// File: js/ui_team.js
(function () {
  const { listTrue, esc } = window.UIH;

  function build() {
    const st = window.AppState.get();
    window.UIFacilityInfo.normalize(st);

    const seniors = [
      { role:"Project Manager", count:1 },
      { role:"Project Coordinator", count:1 }
    ];

    if (st.bimRequired)
      seniors.push({ role:"BIM Manager", count:1 });

    if (listTrue(st.disciplines.wet).length)
      seniors.push({ role:"Senior – Wet Utilities", count:1 });

    if (listTrue(st.disciplines.dry).length)
      seniors.push({ role:"Senior – Dry Utilities", count:1 });

    if (listTrue(st.roadLandscape.items).length)
      seniors.push({ role:"Senior – Road/Landscape", count:1 });

    const hasArch = st.facilities.some(f=>f.doArch);
    const hasStr  = st.facilities.some(f=>f.doStruct);
    const mepSet  = window.UIFacilityInfo.mepUnion(st);

    if (hasArch) seniors.push({ role:"Senior – Architecture", count:1 });
    if (hasStr)  seniors.push({ role:"Senior – Structure", count:1 });
    if (mepSet.length) seniors.push({ role:"Senior – MEP", count:1 });

    const juniors = [];

    listTrue(st.disciplines.wet)
      .forEach(n=>juniors.push({ role:`Junior – Wet Utilities (${n})`, count:1 }));

    listTrue(st.disciplines.dry)
      .forEach(n=>juniors.push({ role:`Junior – Dry Utilities (${n})`, count:1 }));

    listTrue(st.roadLandscape.items)
      .forEach(n=>juniors.push({ role:`Junior – Road/Landscape (${n})`, count:1 }));

    if (hasArch) juniors.push({ role:"Junior – Architecture", count:1 });
    if (hasStr)  juniors.push({ role:"Junior – Structure", count:1 });

    mepSet.forEach(s=>{
      juniors.push({ role:`Junior – MEP (${s})`, count:1 });
    });

    const sum = (a)=>a.reduce((x,r)=>x+r.count,0);

    return {
      seniors,
      juniors,
      totals:{
        seniors: sum(seniors),
        juniors: sum(juniors),
        totalTeam: sum(seniors)+sum(juniors)
      }
    };
  }

  function render(team) {
    const row = r=>`
      <tr>
        <td>${esc(r.role)}</td>
        <td class="tCenter"><b>${r.count}</b></td>
      </tr>`;

    return `
      <div class="tableWrap">
        <table class="tTable">
          <thead><tr><th colspan="2">Seniors</th></tr></thead>
          <tbody>${team.seniors.map(row).join("")}</tbody>
        </table>
      </div>

      <div class="tableWrap" style="margin-top:12px;">
        <table class="tTable">
          <thead><tr><th colspan="2">Juniors</th></tr></thead>
          <tbody>
            ${team.juniors.length ? team.juniors.map(row).join("")
              : `<tr><td colspan="2" class="tCenter muted">No active tasks</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="tableWrap" style="margin-top:12px;">
        <table class="tTable">
          <tbody>
            <tr><td>Total Seniors</td><td class="tCenter"><b>${team.totals.seniors}</b></td></tr>
            <tr><td>Total Juniors</td><td class="tCenter"><b>${team.totals.juniors}</b></td></tr>
            <tr><td>Total Team</td><td class="tCenter"><b>${team.totals.totalTeam}</b></td></tr>
          </tbody>
        </table>
      </div>
    `;
  }

  window.UITeam = { build, render };
})();
