// File: js/ui_team.js
(function () {
  const { i, listTrue, esc } = window.UIH;

  function build() {
    const st = window.AppState.get();
    const dur = Math.max(0, i(st.durationMonths, 0));
    const juniorsPerItem = Math.max(1, Math.ceil(dur / 6));

    const wet = listTrue(st.disciplines.wet);
    const dry = listTrue(st.disciplines.dry);
    const mep = listTrue(st.general.mep.systems);
    const land = listTrue(st.general.landscape.items);

    const archActive = i(st.general.architecture.facilityCount, 0) > 0;
    const strActive  = i(st.general.structure.facilityCount, 0) > 0;

    const seniors = [
      { role:"Project Manager", count:1 },
      { role:"Project Coordinator", count:1 }
    ];
    if (st.bimRequired) seniors.push({ role:"BIM Manager", count:1 });
    if (wet.length) seniors.push({ role:"Senior – Wet Utilities", count:1 });
    if (dry.length) seniors.push({ role:"Senior – Dry Utilities", count:1 });
    if (mep.length) seniors.push({ role:"Senior – MEP", count:1 });
    if (land.length) seniors.push({ role:"Senior – Landscape", count:1 });
    if (archActive) seniors.push({ role:"Senior – Architecture", count:1 });
    if (strActive) seniors.push({ role:"Senior – Structure", count:1 });

    const juniors = [];
    wet.forEach(n => juniors.push({ role:`Junior – Wet Utilities (${n})`, count:juniorsPerItem }));
    dry.forEach(n => juniors.push({ role:`Junior – Dry Utilities (${n})`, count:juniorsPerItem }));
    mep.forEach(n => juniors.push({ role:`Junior – MEP (${n})`, count:juniorsPerItem }));
    land.forEach(n => juniors.push({ role:`Junior – Landscape (${n})`, count:juniorsPerItem }));

    if (archActive) {
      const fac = Math.max(1, i(st.general.architecture.facilityCount, 1));
      juniors.push({ role:"Junior – Architecture (Facilities)", count:Math.max(1, Math.ceil(fac/2)) * juniorsPerItem });
    }
    if (strActive) {
      const fac = Math.max(1, i(st.general.structure.facilityCount, 1));
      juniors.push({ role:"Junior – Structure (Facilities)", count:Math.max(1, Math.ceil(fac/2)) * juniorsPerItem });
    }

    const sum = (a) => a.reduce((x,r)=>x+r.count,0);
    return { durationMonths:dur, juniorsPerActivatedItem:juniorsPerItem, seniors, juniors,
      totals:{ seniors:sum(seniors), juniors:sum(juniors), totalTeam:sum(seniors)+sum(juniors) } };
  }

  function render(team) {
    const row = (r)=>`<tr><td>${esc(r.role)}</td><td class="tCenter"><b>${r.count}</b></td></tr>`;
    return `
      <div class="smallNote">Rule: Juniors per activated sub-item/network = <b>${team.juniorsPerActivatedItem}</b> (based on duration).</div>
      <div class="tableWrap" style="margin-top:10px;"><table class="tTable">
        <thead><tr><th colspan="2">Main Roles / Seniors</th></tr><tr><th>Role</th><th style="width:90px" class="tCenter">Qty</th></tr></thead>
        <tbody>${team.seniors.map(row).join("")}</tbody></table></div>
      <div class="tableWrap" style="margin-top:12px;"><table class="tTable">
        <thead><tr><th colspan="2">Juniors (Per Activated Sub-Item/Network)</th></tr><tr><th>Role</th><th style="width:90px" class="tCenter">Qty</th></tr></thead>
        <tbody>${team.juniors.length?team.juniors.map(row).join(""):`<tr><td colspan="2" class="tCenter muted">No activated sub-items yet</td></tr>`}</tbody>
      </table></div>
      <div class="tableWrap" style="margin-top:12px;"><table class="tTable">
        <thead><tr><th colspan="2">Totals</th></tr></thead>
        <tbody>
          <tr><td>Total Seniors</td><td class="tCenter"><b>${team.totals.seniors}</b></td></tr>
          <tr><td>Total Juniors</td><td class="tCenter"><b>${team.totals.juniors}</b></td></tr>
          <tr><td>Total Team</td><td class="tCenter"><b>${team.totals.totalTeam}</b></td></tr>
        </tbody></table></div>`;
  }

  window.UITeam = { build, render };
})();
