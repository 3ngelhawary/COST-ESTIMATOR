// File: js/ui_facilities.js
(function () {
  const { i, esc, $ } = window.UIH;

  function normalize(block) {
    const c = Math.max(0, i(block.facilityCount, 0));
    block.facilityCount = c;
    if (!Array.isArray(block.facilities)) block.facilities = [];
    const a = block.facilities;
    if (a.length > c) a.length = c;
    while (a.length < c) a.push({ area:"", floors:1 });
    a.forEach(f => { f.area = f.area ?? ""; f.floors = Math.max(1, i(f.floors,1)); });
  }

  function openTable(title, key) {
    const st = window.AppState.get();
    normalize(st.general[key]);
    const rows = st.general[key].facilities.map((f,idx)=>`
      <tr>
        <td class="tCenter">Facility ${idx+1}</td>
        <td><input class="tInput" type="number" min="0" step="1" data-k="${key}" data-r="${idx}" data-c="area" value="${esc(f.area)}"></td>
        <td><input class="tInput" type="number" min="1" step="1" data-k="${key}" data-r="${idx}" data-c="floors" value="${esc(f.floors)}"></td>
      </tr>`).join("");
    const body = `
      <div class="smallNote">Total Facilities: <b>${st.general[key].facilityCount}</b></div>
      <div class="tableWrap"><table class="tTable">
        <thead><tr><th style="width:34%">Facility No.</th><th style="width:33%">Facility Area</th><th style="width:33%">No. of Floors</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="3" class="tCenter muted">Set No. of Facilities &gt; 0</td></tr>`}</tbody>
      </table></div>`;
    window.UIModal.show(title, body);
    $("modalBody").addEventListener("input", onEdit);
    $("modalBody").addEventListener("change", onEdit);
  }

  function onEdit(e) {
    const el = e.target;
    if (!(el instanceof HTMLInputElement) || !el.classList.contains("tInput")) return;
    const st = window.AppState.get();
    const k = el.getAttribute("data-k");
    const r = i(el.getAttribute("data-r"), -1);
    const c = el.getAttribute("data-c");
    if (!k || r < 0 || !c) return;
    normalize(st.general[k]);
    const rec = st.general[k].facilities[r]; if (!rec) return;
    if (c === "area") rec.area = el.value;
    if (c === "floors") { rec.floors = Math.max(1, i(el.value,1)); el.value = String(rec.floors); }
    window.UIRender.preview();
  }

  window.UIFacilities = { normalize, openTable };
})();
