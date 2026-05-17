// File: js/ui_facilityinfo.js
(function () {
  const { $, esc, i } = window.UIH;

  function ensureRowShape(r) {
    return {
      type:     r?.type    ?? "Building",
      count:    Math.max(0, i(r?.count, 0)),
      area:     r?.area    ?? "",
      floors:   Math.max(1, i(r?.floors, 1)),
      doStruct: !!r?.doStruct,
      doArch:   !!r?.doArch,
      doMEP:    !!r?.doMEP,
      mep:      r?.mep ?? {}
    };
  }

  function normalize(st) {
    if (!Array.isArray(st.facilities)) st.facilities = [];
    st.facilities = st.facilities.map(ensureRowShape);
  }

  function openFacilityTable() {
    const st = window.AppState.get();
    normalize(st);

    const rows = st.facilities.map((r, idx) => rowHtml(r, idx)).join("");
    const body = `
      <div class="field-note" style="margin-bottom:10px;">
        Add / edit facility rows. Tick Structure / Arch / MEP to include in team and pricing.
      </div>
      <div class="table-wrap">
        <table class="t-table">
          <thead>
            <tr>
              <th style="width:16%">Type</th>
              <th style="width:12%">Count</th>
              <th style="width:14%">Area / Floor (m²)</th>
              <th style="width:10%">Floors</th>
              <th style="width:10%" class="tc">Structure</th>
              <th style="width:10%" class="tc">Arch</th>
              <th style="width:10%" class="tc">MEP</th>
              <th style="width:12%" class="tc">MEP Items</th>
              <th style="width:6%"  class="tc">Del</th>
            </tr>
          </thead>
          <tbody id="facTbody">
            ${rows || `<tr><td colspan="9" class="tCenter muted" style="padding:14px">No rows yet — click Add Row.</td></tr>`}
          </tbody>
        </table>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-start;margin-top:12px;">
        <button type="button" id="facAddRowBtn">+ Add Row</button>
      </div>`;

    window.UIModal.show("Facility Information", body);
    bindTableEvents();
  }

  function rowHtml(r, idx) {
    const mepCount = Object.values(r.mep || {}).filter(v => v === true).length;
    return `
      <tr data-idx="${idx}">
        <td>
          <select class="tInput" data-c="type">
            ${window.APP_CONFIG.facilityTypes.map(t =>
              `<option value="${esc(t)}" ${r.type === t ? "selected" : ""}>${esc(t)}</option>`
            ).join("")}
          </select>
        </td>
        <td><input class="tInput" type="number" min="0" step="1" data-c="count"  value="${esc(r.count)}"></td>
        <td><input class="tInput" type="number" min="0" step="1" data-c="area"   value="${esc(r.area)}" placeholder="m²"></td>
        <td><input class="tInput" type="number" min="1" step="1" data-c="floors" value="${esc(r.floors)}"></td>
        <td class="tc"><input type="checkbox" data-c="doStruct" ${r.doStruct ? "checked" : ""}></td>
        <td class="tc"><input type="checkbox" data-c="doArch"   ${r.doArch   ? "checked" : ""}></td>
        <td class="tc"><input type="checkbox" data-c="doMEP"    ${r.doMEP    ? "checked" : ""}></td>
        <td class="tc">
          <button type="button" data-c="mepBtn" ${r.doMEP ? "" : "disabled"}>
            ${mepCount ? mepCount + " selected" : "Select"}
          </button>
        </td>
        <td class="tc">
          <button type="button" data-c="delBtn" style="color:#f87171;border-color:#f87171;">✕</button>
        </td>
      </tr>`;
  }

  function bindTableEvents() {
    const st = window.AppState.get();
    const addBtn = document.getElementById("facAddRowBtn");
    const tbody  = document.getElementById("facTbody");

    addBtn.onclick = () => {
      normalize(st);
      st.facilities.push(ensureRowShape({ type: "Building", count: 0, area: "", floors: 1 }));
      refreshTbody();
      window.UIRender.preview();
    };

    tbody.oninput  = (e) => handleCellChange(e);
    tbody.onchange = (e) => handleCellChange(e);
    tbody.onclick  = (e) => handleClick(e);
  }

  function handleCellChange(e) {
    const tr  = e.target.closest("tr[data-idx]"); if (!tr) return;
    const idx = parseInt(tr.getAttribute("data-idx"), 10);
    const col = e.target.getAttribute("data-c");
    if (!Number.isFinite(idx) || !col) return;

    const st = window.AppState.get();
    normalize(st);
    const r = st.facilities[idx]; if (!r) return;

    if (col === "type")    r.type    = e.target.value;
    if (col === "count")   r.count   = Math.max(0, parseInt(e.target.value || "0", 10) || 0);
    if (col === "area")    r.area    = e.target.value;
    if (col === "floors")  { r.floors = Math.max(1, parseInt(e.target.value || "1", 10) || 1); e.target.value = String(r.floors); }
    if (col === "doStruct") r.doStruct = !!e.target.checked;
    if (col === "doArch")   r.doArch   = !!e.target.checked;
    if (col === "doMEP")  {
      r.doMEP = !!e.target.checked;
      if (!r.doMEP) r.mep = {};
      refreshTbody();
    }

    // Changing scope resets auto team
    st.teamOverrides   = {};
    st._juniorManual   = false;
    st.autoJuniorLevel = 1;
    window.UIRender.preview();
  }

  function handleClick(e) {
    const btn = e.target.closest("button[data-c]"); if (!btn) return;
    const tr  = btn.closest("tr[data-idx]");        if (!tr)  return;
    const idx = parseInt(tr.getAttribute("data-idx"), 10);
    const col = btn.getAttribute("data-c");

    if (col === "mepBtn") { openMepSelector(idx); return; }

    if (col === "delBtn") {
      const st = window.AppState.get();
      normalize(st);
      st.facilities.splice(idx, 1);
      st.teamOverrides   = {};
      st._juniorManual   = false;
      st.autoJuniorLevel = 1;
      refreshTbody();
      window.UIRender.preview();
    }
  }

  function openMepSelector(rowIndex) {
    const st = window.AppState.get();
    normalize(st);
    const r = st.facilities[rowIndex];

    const checks = window.APP_CONFIG.mepSystems.map(s => {
      const on = r.mep?.[s] ? "checked" : "";
      return `
        <label class="checkItem">
          <input type="checkbox" data-mep="${esc(s)}" ${on}>
          <div class="txt">${esc(s)}</div>
        </label>`;
    }).join("");

    const body = `
      <div class="field-note" style="margin-bottom:10px;">Select MEP systems for this facility row.</div>
      <div class="checkGrid" id="mepGrid">${checks}</div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px;">
        <button type="button" id="mepDoneBtn">← Back to Facilities</button>
      </div>`;

    window.UIModal.show(`MEP Systems (Row ${rowIndex + 1})`, body);

    $("mepGrid").onchange = (e) => {
      const el = e.target;
      if (!(el instanceof HTMLInputElement) || el.type !== "checkbox") return;
      const key = el.getAttribute("data-mep"); if (!key) return;
      r.mep[key] = !!el.checked;
      st.teamOverrides   = {};
      st._juniorManual   = false;
      st.autoJuniorLevel = 1;
      window.UIRender.preview();
    };

    $("mepDoneBtn").onclick = () => openFacilityTable();
  }

  function refreshTbody() {
    const st    = window.AppState.get();
    normalize(st);
    const tbody = document.getElementById("facTbody");
    if (!tbody) return;
    tbody.innerHTML = st.facilities.length
      ? st.facilities.map((r, idx) => rowHtml(r, idx)).join("")
      : `<tr><td colspan="9" class="tCenter muted" style="padding:14px">No rows yet — click Add Row.</td></tr>`;
  }

  // How much facility area in total (count × floors × area per floor)
  function totalFacilityAreaM2(st) {
    normalize(st);
    let a = 0;
    st.facilities.forEach(r => {
      a += (parseInt(r.count,10)||0) * (parseInt(r.floors,10)||1) * (parseFloat(r.area)||0);
    });
    return a;
  }

  window.UIFacilityInfo = { openFacilityTable, normalize, totalFacilityAreaM2 };
})();
