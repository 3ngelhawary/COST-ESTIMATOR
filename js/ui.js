// File: js/ui.js
(function () {
  const $ = (id) => document.getElementById(id);
  let state = JSON.parse(JSON.stringify(window.DEFAULT_STATE));

  // ---------- Modal (single, reused) ----------
  function ensureModal() {
    if (document.getElementById("modalOverlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "modalOverlay";
    overlay.className = "modalOverlay hidden";
    overlay.innerHTML = `
      <div class="modalCard" role="dialog" aria-modal="true">
        <div class="modalHeader">
          <div class="modalTitle" id="modalTitle">Edit Facilities</div>
          <button type="button" class="modalCloseBtn" id="modalCloseBtn">✕</button>
        </div>
        <div class="modalBody" id="modalBody"></div>
        <div class="modalFooter">
          <button type="button" class="secondary" id="modalCancelBtn">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const close = () => hideModal();
    document.getElementById("modalCloseBtn").addEventListener("click", close);
    document.getElementById("modalCancelBtn").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !overlay.classList.contains("hidden")) close();
    });
  }

  function showModal(title, bodyHtml) {
    ensureModal();
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = bodyHtml;
    document.getElementById("modalOverlay").classList.remove("hidden");
  }

  function hideModal() {
    const overlay = document.getElementById("modalOverlay");
    if (overlay) overlay.classList.add("hidden");
  }

  // ---------- Helpers ----------
  function escapeAttr(v) {
    const s = String(v ?? "");
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function coerceInt(v, fallback = 0) {
    const n = parseInt(String(v ?? ""), 10);
    return Number.isFinite(n) ? n : fallback;
  }

  function anyTrue(mapObj) {
    if (!mapObj) return false;
    return Object.values(mapObj).some(v => v === true);
  }

  function listTrueKeys(mapObj) {
    if (!mapObj) return [];
    return Object.entries(mapObj).filter(([, v]) => v === true).map(([k]) => k);
  }

  function ensureMaps() {
    if (!state.disciplines) state.disciplines = { wet: {}, dry: {} };
    if (!state.disciplines.wet) state.disciplines.wet = {};
    if (!state.disciplines.dry) state.disciplines.dry = {};

    if (!state.general) state.general = JSON.parse(JSON.stringify(window.DEFAULT_STATE.general));

    if (!state.general.architecture) state.general.architecture = { facilityCount: 0, facilities: [] };
    if (!state.general.structure) state.general.structure = { facilityCount: 0, facilities: [] };

    if (!state.general.mep) state.general.mep = { systems: {} };
    if (!state.general.mep.systems) state.general.mep.systems = {};

    if (!state.general.landscape) state.general.landscape = { items: {} };
    if (!state.general.landscape.items) state.general.landscape.items = {};
  }

  function normalizeFacilities(block) {
    const count = Math.max(0, coerceInt(block.facilityCount, 0));
    block.facilityCount = count;

    if (!Array.isArray(block.facilities)) block.facilities = [];
    const arr = block.facilities;

    if (arr.length > count) arr.length = count;
    while (arr.length < count) arr.push({ area: "", floors: 1 });

    for (const f of arr) {
      f.area = (f.area === undefined || f.area === null) ? "" : f.area;
      f.floors = Math.max(1, coerceInt(f.floors, 1));
    }
  }

  // ---------- Facility Table Modal ----------
  function buildFacilityTableHtml(title, blockKey) {
    const block = state.general[blockKey];
    normalizeFacilities(block);

    const rows = block.facilities.map((f, idx) => {
      const i = idx + 1;
      return `
        <tr>
          <td class="tCenter">Facility ${i}</td>
          <td><input class="tInput" type="number" min="0" step="1" data-fkey="${blockKey}" data-row="${idx}" data-col="area" value="${escapeAttr(f.area)}"></td>
          <td><input class="tInput" type="number" min="1" step="1" data-fkey="${blockKey}" data-row="${idx}" data-col="floors" value="${escapeAttr(f.floors)}"></td>
        </tr>
      `;
    }).join("");

    const body = `
      <div class="smallNote">Total Facilities: <b>${block.facilityCount}</b></div>
      <div class="tableWrap">
        <table class="tTable">
          <thead>
            <tr>
              <th style="width:34%;">Facility No.</th>
              <th style="width:33%;">Facility Area</th>
              <th style="width:33%;">No. of Floors</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="3" class="tCenter muted">Set No. of Facilities &gt; 0</td></tr>`}
          </tbody>
        </table>
      </div>
    `;

    showModal(title, body);

    const modalBody = document.getElementById("modalBody");
    modalBody.addEventListener("input", onFacilityTableInput);
    modalBody.addEventListener("change", onFacilityTableInput);
  }

  function onFacilityTableInput(e) {
    const el = e.target;
    if (!(el instanceof HTMLInputElement)) return;
    if (!el.classList.contains("tInput")) return;

    const blockKey = el.getAttribute("data-fkey");
    const row = coerceInt(el.getAttribute("data-row"), -1);
    const col = el.getAttribute("data-col");

    if (!blockKey || row < 0 || !col) return;

    const block = state.general[blockKey];
    normalizeFacilities(block);

    const rec = block.facilities[row];
    if (!rec) return;

    if (col === "area") {
      rec.area = el.value;
    } else if (col === "floors") {
      rec.floors = Math.max(1, coerceInt(el.value, 1));
      el.value = String(rec.floors);
    }

    preview();
  }

  // ---------- Team Structure ----------
  function buildTeamStructure() {
    const duration = Math.max(0, coerceInt(state.durationMonths, 0));

    // juniors per activated sub-item/network (simple duration-based rule)
    // 1 junior for <=6 months, 2 juniors for 7-12, 3 juniors for 13-18, etc.
    const juniorsPerItem = Math.max(1, Math.ceil(duration / 6));

    const wetActiveItems = listTrueKeys(state.disciplines.wet);
    const dryActiveItems = listTrueKeys(state.disciplines.dry);

    const mepActiveItems = listTrueKeys(state.general.mep.systems);
    const landscapeActiveItems = listTrueKeys(state.general.landscape.items);

    const archActive = coerceInt(state.general.architecture.facilityCount, 0) > 0;
    const strActive = coerceInt(state.general.structure.facilityCount, 0) > 0;

    const seniors = [];
    const juniors = [];

    // main roles (always)
    seniors.push({ role: "Project Manager", count: 1 });
    seniors.push({ role: "Project Coordinator", count: 1 });

    // BIM manager if BIM required
    if (state.bimRequired) seniors.push({ role: "BIM Manager", count: 1 });

    // seniors per discipline (if any activated)
    if (wetActiveItems.length > 0) seniors.push({ role: "Senior – Wet Utilities", count: 1 });
    if (dryActiveItems.length > 0) seniors.push({ role: "Senior – Dry Utilities", count: 1 });
    if (mepActiveItems.length > 0) seniors.push({ role: "Senior – MEP", count: 1 });
    if (landscapeActiveItems.length > 0) seniors.push({ role: "Senior – Landscape", count: 1 });
    if (archActive) seniors.push({ role: "Senior – Architecture", count: 1 });
    if (strActive) seniors.push({ role: "Senior – Structure", count: 1 });

    // juniors per activated sub-item/network
    // Wet/Dry: each activated network adds juniors
    for (const name of wetActiveItems) {
      juniors.push({ role: `Junior – Wet Utilities (${name})`, count: juniorsPerItem });
    }
    for (const name of dryActiveItems) {
      juniors.push({ role: `Junior – Dry Utilities (${name})`, count: juniorsPerItem });
    }

    // MEP: each activated system adds juniors
    for (const sys of mepActiveItems) {
      juniors.push({ role: `Junior – MEP (${sys})`, count: juniorsPerItem });
    }

    // Landscape: each activated item adds juniors
    for (const it of landscapeActiveItems) {
      juniors.push({ role: `Junior – Landscape (${it})`, count: juniorsPerItem });
    }

    // Arch/Str: if activated, add juniors based on facility count
    if (archActive) {
      const fac = Math.max(1, coerceInt(state.general.architecture.facilityCount, 1));
      juniors.push({ role: "Junior – Architecture (Facilities)", count: Math.max(1, Math.ceil(fac / 2)) * juniorsPerItem });
    }
    if (strActive) {
      const fac = Math.max(1, coerceInt(state.general.structure.facilityCount, 1));
      juniors.push({ role: "Junior – Structure (Facilities)", count: Math.max(1, Math.ceil(fac / 2)) * juniorsPerItem });
    }

    // totals
    const totalSeniors = seniors.reduce((a, r) => a + r.count, 0);
    const totalJuniors = juniors.reduce((a, r) => a + r.count, 0);

    return {
      durationMonths: duration,
      juniorsPerActivatedItem: juniorsPerItem,
      seniors,
      juniors,
      totals: {
        seniors: totalSeniors,
        juniors: totalJuniors,
        totalTeam: totalSeniors + totalJuniors
      }
    };
  }

  function renderTeamStructure(team) {
    const lines = [];

    lines.push(`
      <div class="smallNote">
        Rule: Juniors per activated sub-item/network = <b>${team.juniorsPerActivatedItem}</b> (based on duration).
      </div>
    `);

    const row = (r) => `
      <tr>
        <td>${escapeAttr(r.role)}</td>
        <td class="tCenter"><b>${r.count}</b></td>
      </tr>
    `;

    lines.push(`
      <div class="tableWrap" style="margin-top:10px;">
        <table class="tTable">
          <thead>
            <tr><th colspan="2">Main Roles / Seniors</th></tr>
            <tr>
              <th>Role</th>
              <th style="width:90px;" class="tCenter">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${team.seniors.map(row).join("")}
          </tbody>
        </table>
      </div>
    `);

    lines.push(`
      <div class="tableWrap" style="margin-top:12px;">
        <table class="tTable">
          <thead>
            <tr><th colspan="2">Juniors (Per Activated Sub-Item/Network)</th></tr>
            <tr>
              <th>Role</th>
              <th style="width:90px;" class="tCenter">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${team.juniors.length ? team.juniors.map(row).join("") : `<tr><td colspan="2" class="tCenter muted">No activated sub-items yet</td></tr>`}
          </tbody>
        </table>
      </div>
    `);

    lines.push(`
      <div class="tableWrap" style="margin-top:12px;">
        <table class="tTable">
          <thead>
            <tr><th colspan="2">Totals</th></tr>
          </thead>
          <tbody>
            <tr><td>Total Seniors</td><td class="tCenter"><b>${team.totals.seniors}</b></td></tr>
            <tr><td>Total Juniors</td><td class="tCenter"><b>${team.totals.juniors}</b></td></tr>
            <tr><td>Total Team</td><td class="tCenter"><b>${team.totals.totalTeam}</b></td></tr>
          </tbody>
        </table>
      </div>
    `);

    $("teamOut").innerHTML = lines.join("");
  }

  // ---------- Rendering ----------
  function renderInputs() {
    ensureMaps();
    normalizeFacilities(state.general.architecture);
    normalizeFacilities(state.general.structure);

    const requiredList = state.bimRequired
      ? window.APP_CONFIG.requiredDetailBim
      : window.APP_CONFIG.requiredDetailNonBim;

    const requiredHtml = requiredList.map(item => {
      const checked = state.requiredDetails[item.id] ? "checked" : "";
      return `
        <label class="checkItem">
          <input type="checkbox" data-kind="required" data-id="${item.id}" ${checked}>
          <div>
            <div class="txt">${item.label}</div>
            ${item.sub ? `<div class="sub">${item.sub}</div>` : ""}
          </div>
        </label>
      `;
    }).join("");

    const wetHtml = window.APP_CONFIG.disciplines.wet.map(name => {
      const checked = state.disciplines.wet?.[name] ? "checked" : "";
      return `
        <label class="checkItem">
          <input type="checkbox" data-kind="wet" data-id="${escapeAttr(name)}" ${checked}>
          <div class="txt">${escapeAttr(name)}</div>
        </label>
      `;
    }).join("");

    const dryHtml = window.APP_CONFIG.disciplines.dry.map(name => {
      const checked = state.disciplines.dry?.[name] ? "checked" : "";
      return `
        <label class="checkItem">
          <input type="checkbox" data-kind="dry" data-id="${escapeAttr(name)}" ${checked}>
          <div class="txt">${escapeAttr(name)}</div>
        </label>
      `;
    }).join("");

    const mepHtml = window.APP_CONFIG.mepSystems.map(sys => {
      const checked = state.general.mep.systems?.[sys] ? "checked" : "";
      return `
        <label class="checkItem">
          <input type="checkbox" data-kind="mep" data-id="${escapeAttr(sys)}" ${checked}>
          <div class="txt">${escapeAttr(sys)}</div>
        </label>
      `;
    }).join("");

    const landscapeHtml = window.APP_CONFIG.landscapeItems.map(item => {
      const checked = state.general.landscape.items?.[item] ? "checked" : "";
      return `
        <label class="checkItem">
          <input type="checkbox" data-kind="landscape" data-id="${escapeAttr(item)}" ${checked}>
          <div class="txt">${escapeAttr(item)}</div>
        </label>
      `;
    }).join("");

    // Rearranged order after Required Detail:
    // Wet | Dry -> MEP -> Landscape -> Arch -> Struc
    $("inputs").innerHTML = `
      <div class="field">
        <label>Project Name</label>
        <input id="projectName" type="text" value="${escapeAttr(state.projectName)}">
      </div>

      <div class="row">
        <div class="field">
          <label>Project Area (sq.m)</label>
          <input id="projectAreaSqm" type="number" min="0" value="${escapeAttr(state.projectAreaSqm)}">
        </div>
        <div class="field">
          <label>Required Duration (Months)</label>
          <input id="durationMonths" type="number" min="1" value="${escapeAttr(state.durationMonths)}">
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>Desired Drawing Scale</label>
          <select id="drawingScale">
            ${window.APP_CONFIG.drawingScales.map(s =>
              `<option value="${escapeAttr(s)}" ${state.drawingScale === s ? "selected" : ""}>${s}</option>`
            ).join("")}
          </select>
        </div>

        <div class="toggleRow">
          <div class="left">
            <div class="t">BIM Required</div>
            <div class="s">Switch to LOD mode</div>
          </div>
          <label class="switch">
            <input id="bimRequired" type="checkbox" ${state.bimRequired ? "checked" : ""}>
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="groupTitle"><h3>Required Detail</h3></div>
      <div class="checkGrid">${requiredHtml}</div>

      <div class="divider"></div>

      <div class="row">
        <div>
          <div class="groupTitle"><h3>Wet Utilities</h3></div>
          <div class="checkGrid">${wetHtml}</div>
        </div>
        <div>
          <div class="groupTitle"><h3>Dry Utilities</h3></div>
          <div class="checkGrid">${dryHtml}</div>
        </div>
      </div>

      <div class="groupTitle"><h3>MEP</h3></div>
      <div class="checkGrid">${mepHtml}</div>

      <div class="groupTitle"><h3>Landscape</h3></div>
      <div class="checkGrid">${landscapeHtml}</div>

      <div class="groupTitle"><h3>Architecture</h3></div>
      <div class="row">
        <div class="field">
          <label>No. of Facilities</label>
          <input id="archFacilityCount" type="number" min="0" step="1" value="${escapeAttr(state.general.architecture.facilityCount ?? 0)}">
          <div class="smallNote">Click "Edit Table" to enter area & floors for each facility.</div>
        </div>
        <div class="field">
          <label>&nbsp;</label>
          <button type="button" class="fullWidth" id="archEditBtn">Edit Table</button>
        </div>
      </div>

      <div class="groupTitle"><h3>Structure</h3></div>
      <div class="row">
        <div class="field">
          <label>No. of Facilities</label>
          <input id="strFacilityCount" type="number" min="0" step="1" value="${escapeAttr(state.general.structure.facilityCount ?? 0)}">
          <div class="smallNote">Click "Edit Table" to enter area & floors for each facility.</div>
        </div>
        <div class="field">
          <label>&nbsp;</label>
          <button type="button" class="fullWidth" id="strEditBtn">Edit Table</button>
        </div>
      </div>
    `;

    wireEvents();
  }

  // ---------- Events ----------
  function wireEvents() {
    $("projectName").oninput = e => { state.projectName = e.target.value; preview(); };
    $("projectAreaSqm").oninput = e => { state.projectAreaSqm = e.target.value; preview(); };
    $("durationMonths").oninput = e => { state.durationMonths = e.target.value; preview(); };
    $("drawingScale").onchange = e => { state.drawingScale = e.target.value; preview(); };

    // BIM toggle (defer re-render to avoid stuck toggle)
    $("bimRequired").onchange = e => {
      state.bimRequired = !!e.target.checked;
      requestAnimationFrame(() => {
        renderInputs();
        preview();
      });
    };

    // Facilities count
    $("archFacilityCount").oninput = e => {
      state.general.architecture.facilityCount = coerceInt(e.target.value, 0);
      normalizeFacilities(state.general.architecture);
      preview();
    };
    $("strFacilityCount").oninput = e => {
      state.general.structure.facilityCount = coerceInt(e.target.value, 0);
      normalizeFacilities(state.general.structure);
      preview();
    };

    // Edit tables
    $("archEditBtn").onclick = () => buildFacilityTableHtml("Architecture — Facilities Table", "architecture");
    $("strEditBtn").onclick = () => buildFacilityTableHtml("Structure — Facilities Table", "structure");

    // Checkbox delegation
    $("inputs").onchange = e => {
      const el = e.target;
      if (!(el instanceof HTMLInputElement)) return;
      if (el.type !== "checkbox") return;

      const kind = el.dataset.kind;
      const id = el.dataset.id;
      if (!kind || !id) return;

      if (kind === "required") {
        state.requiredDetails[id] = el.checked;
        preview();
        return;
      }

      if (kind === "wet" || kind === "dry") {
        state.disciplines[kind][id] = el.checked;
        preview();
        return;
      }

      if (kind === "mep") {
        state.general.mep.systems[id] = el.checked;
        preview();
        return;
      }

      if (kind === "landscape") {
        state.general.landscape.items[id] = el.checked;
        preview();
        return;
      }
    };
  }

  // ---------- Output Preview ----------
  function preview() {
    const projectOut = $("projectOut");
    const durationOut = $("durationOut");
    const jsonOut = $("jsonOut");

    if (projectOut) projectOut.textContent = state.projectName || "—";
    if (durationOut) durationOut.textContent = state.durationMonths || "—";

    const team = buildTeamStructure();
    renderTeamStructure(team);

    // include computed output into JSON for future pricing engine
    const payload = {
      ...state,
      output: {
        teamStructure: team
      }
    };

    if (jsonOut) jsonOut.textContent = JSON.stringify(payload, null, 2);
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderInputs();
    preview();
  });
})();
