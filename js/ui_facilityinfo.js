// File: js/ui_facilityinfo.js
(function () {
  const { $, esc, i } = window.UIH;

  function ensureRowShape(r){
    return {
      type: r?.type ?? "Building",
      count: Math.max(0, i(r?.count, 0)),
      area: r?.area ?? "",
      floors: Math.max(1, i(r?.floors, 1)),
      doStruct: !!r?.doStruct,
      doArch: !!r?.doArch,
      doMEP: !!r?.doMEP,
      mep: r?.mep ?? {}
    };
  }

  function normalize(st){
    if (!Array.isArray(st.facilities)) st.facilities = [];
    st.facilities = st.facilities.map(ensureRowShape);
  }

  function openFacilityTable(){
    const st = window.AppState.get();
    normalize(st);

    const typeOpts = window.APP_CONFIG.facilityTypes
      .map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join("");

    const rows = st.facilities.map((r,idx)=>rowHtml(r, idx, typeOpts)).join("");
    const body = `
      <div class="smallNote">Add / edit facility rows. Tick Arch/Structure/MEP to define scope.</div>
      <div class="tableWrap">
        <table class="tTable">
          <thead>
            <tr>
              <th style="width:18%">Facility Type</th>
              <th style="width:14%">No. of Facilities</th>
              <th style="width:14%">Facility Area</th>
              <th style="width:12%">No. of Floors</th>
              <th style="width:10%" class="tCenter">Structure</th>
              <th style="width:10%" class="tCenter">Arch</th>
              <th style="width:10%" class="tCenter">MEP</th>
              <th style="width:12%" class="tCenter">MEP Items</th>
            </tr>
          </thead>
          <tbody id="facTbody">
            ${rows || `<tr><td colspan="8" class="tCenter muted">No rows yet. Click "Add Row".</td></tr>`}
          </tbody>
        </table>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px;">
        <button type="button" id="facAddRowBtn">Add Row</button>
      </div>
    `;

    window.UIModal.show("Facility Information", body);
    bindTableEvents(typeOpts);
  }

  function rowHtml(r, idx, typeOpts){
    const mepCount = Object.values(r.mep || {}).filter(v=>v===true).length;
    return `
      <tr data-idx="${idx}">
        <td>
          <select class="tInput" data-c="type">
            ${window.APP_CONFIG.facilityTypes.map(t=>`<option value="${esc(t)}" ${r.type===t?"selected":""}>${esc(t)}</option>`).join("")}
          </select>
        </td>
        <td><input class="tInput" type="number" min="0" step="1" data-c="count" value="${esc(r.count)}"></td>
        <td><input class="tInput" type="number" min="0" step="1" data-c="area" value="${esc(r.area)}"></td>
        <td><input class="tInput" type="number" min="1" step="1" data-c="floors" value="${esc(r.floors)}"></td>
        <td class="tCenter"><input type="checkbox" data-c="doStruct" ${r.doStruct?"checked":""}></td>
        <td class="tCenter"><input type="checkbox" data-c="doArch" ${r.doArch?"checked":""}></td>
        <td class="tCenter"><input type="checkbox" data-c="doMEP" ${r.doMEP?"checked":""}></td>
        <td class="tCenter">
          <button type="button" data-c="mepBtn" ${r.doMEP?"":"disabled"}>${mepCount?mepCount+" selected":"Select"}</button>
        </td>
      </tr>`;
  }

  function bindTableEvents(){
    const st = window.AppState.get();
    const tbody = document.getElementById("facTbody");
    const addBtn = document.getElementById("facAddRowBtn");

    addBtn.onclick = () => {
      normalize(st);
      st.facilities.push(ensureRowShape({ type:"Building", count:0, area:"", floors:1 }));
      refreshTbody();
      window.UIRender.preview();
    };

    tbody.oninput = (e)=>handleCellChange(e);
    tbody.onchange = (e)=>handleCellChange(e);
    tbody.onclick = (e)=>handleClick(e);
  }

  function handleCellChange(e){
    const tr = e.target.closest("tr[data-idx]");
    if (!tr) return;
    const idx = parseInt(tr.getAttribute("data-idx"), 10);
    const col = e.target.getAttribute("data-c");
    if (!Number.isFinite(idx) || !col) return;

    const st = window.AppState.get();
    normalize(st);
    const r = st.facilities[idx];
    if (!r) return;

    if (col === "type") r.type = e.target.value;
    if (col === "count") r.count = Math.max(0, parseInt(e.target.value || "0", 10) || 0);
    if (col === "area") r.area = e.target.value;
    if (col === "floors") {
      r.floors = Math.max(1, parseInt(e.target.value || "1", 10) || 1);
      e.target.value = String(r.floors);
    }
    if (col === "doStruct") r.doStruct = !!e.target.checked;
    if (col === "doArch") r.doArch = !!e.target.checked;
    if (col === "doMEP") {
      r.doMEP = !!e.target.checked;
      if (!r.doMEP) r.mep = {};
      refreshTbody();
    }

    window.UIRender.preview();
  }

  function handleClick(e){
    const btn = e.target.closest("button[data-c='mepBtn']");
    if (!btn) return;
    const tr = btn.closest("tr[data-idx]");
    const idx = parseInt(tr.getAttribute("data-idx"), 10);

    const st = window.AppState.get();
    normalize(st);
    const r = st.facilities[idx];
    if (!r || !r.doMEP) return;

    openMepSelector(idx);
  }

  function openMepSelector(rowIndex){
    const st = window.AppState.get();
    normalize(st);
    const r = st.facilities[rowIndex];

    const checks = window.APP_CONFIG.mepSystems.map(s=>{
      const on = r.mep?.[s] ? "checked" : "";
      return `
        <label class="checkItem">
          <input type="checkbox" data-mep="${esc(s)}" ${on}>
          <div class="txt">${esc(s)}</div>
        </label>`;
    }).join("");

    const body = `
      <div class="smallNote">Select MEP systems for this facility row.</div>
      <div class="checkGrid" id="mepGrid">${checks}</div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px;">
        <button type="button" class="secondary" id="mepCloseBtn">Done</button>
      </div>
    `;

    window.UIModal.show(`MEP Systems (Row ${rowIndex+1})`, body);

    $("mepGrid").onchange = (e)=>{
      const el = e.target;
      if (!(el instanceof HTMLInputElement) || el.type !== "checkbox") return;
      const key = el.getAttribute("data-mep");
      if (!key) return;
      r.mep[key] = !!el.checked;
      window.UIRender.preview();
    };
    $("mepCloseBtn").onclick = ()=>openFacilityTable();
  }

  function refreshTbody(){
    const st = window.AppState.get();
    normalize(st);
    const tbody = document.getElementById("facTbody");
    if (!tbody) return;

    tbody.innerHTML = st.facilities.length
      ? st.facilities.map((r,idx)=>rowHtml(r, idx)).join("")
      : `<tr><td colspan="8" class="tCenter muted">No rows yet. Click "Add Row".</td></tr>`;
  }

  function anyScope(st){
    normalize(st);
    const arch = st.facilities.some(r=>r.doArch);
    const str  = st.facilities.some(r=>r.doStruct);
    const mep  = st.facilities.some(r=>r.doMEP && Object.values(r.mep||{}).some(v=>v===true));
    return { arch, str, mep };
  }

  function mepUnion(st){
    normalize(st);
    const set = new Set();
    st.facilities.forEach(r=>{
      if (!r.doMEP) return;
      Object.entries(r.mep||{}).forEach(([k,v])=>{ if (v===true) set.add(k); });
    });
    return [...set];
  }

  window.UIFacilityInfo = { openFacilityTable, anyScope, mepUnion, normalize };
})();
