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
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
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

  function ensureMaps() {
    if (!state.disciplines) state.disciplines = { wet: {}, dry: {} };
    if (!state.disciplines.wet) state.disciplines.wet = {};
    if (!state.disciplines.dry) state.disciplines.dry = {};

    if (!state.general) state.general = JSON.parse(JSON.stringify(window.DEFAULT_STATE.general));

    if (!state.general.architecture) state.general.architecture = { enabled: false, facilityCount: 0, facilities: [] };
    if (state.general.architecture.enabled === undefined) state.general.architecture.enabled = false;

    if (!state.general.structure) state.general.structure = { enabled: false, facilityCount: 0, facilities: [] };
    if (state.general.structure.enabled === undefined) state.general.structure.enabled = false;

    if (!state.general.mep) state.general.mep = { systems: {} };
    if (!state.general.mep.systems) state.general.mep.systems = {};

    if (!state.general.landscape) state.general.landscape = { items: {} };
    if (!state.general.landscape.items) state.general.landscape.items = {};
  }

  function normalizeFacilities(block) {
    const enabled = !!block.enabled;
    const count = Math.max(0, coerceInt(block.facilityCount, 0));
    block.facilityCount = count;

    if (!Array.isArray(block.facilities)) block.facilities = [];
    const arr = block.facilities;

    // keep facilities array length aligned even if disabled (so data isn't lost)
    if (arr.length > count) arr.length = count;
    while (arr.length < count) arr.push({ area: "", floors: 1 });

    for (const f of arr) {
      const floors = coerceInt(f.floors, 1);
      f.floors = Math.max(1, floors);
      if (f.area === undefined || f.area === null) f.area = "";
    }

    // if disabled, we still keep the data, but UI will be disabled.
    return enabled;
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
      <div class="smallNote">
        Total Facilities: <b>${block.facilityCount}</b>
      </div>

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

    // Rearranged order AFTER Required Detail:
    // Wet|Dry -> MEP -> Landscape -> Arch -> Struc

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

    const arch = state.general.architecture;
    const str = state.general.structure;

    const archDisabled = arch.enabled ? "" : "disabled";
    const strDisabled = str.enabled ? "" : "disabled";

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

      <div class="groupTitle">
        <h3>Architecture</h3>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);">
          <input type="checkbox" id="archEnabled" ${arch.enabled ? "checked" : ""}>
          Enable
        </label>
      </div>
      <div class="row">
        <div class="field">
          <label>No. of Facilities</label>
          <input id="archFacilityCount" type="number" min="0" step="1" value="${escapeAttr(arch.facilityCount ?? 0)}" ${archDisabled}>
          <div class="smallNote">Click "Edit Table" to enter area & floors for each facility.</div>
        </div>
        <div class="field">
          <label>&nbsp;</label>
          <button type="button" class="fullWidth" id="archEditBtn" ${archDisabled}>Edit Table</button>
        </div>
      </div>

      <div class="groupTitle">
        <h3>Structure</h3>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);">
          <input type="checkbox" id="strEnabled" ${str.enabled ? "checked" : ""}>
          Enable
        </label>
      </div>
      <div class="row">
        <div class="field">
          <label>No. of Facilities</label>
          <input id="strFacilityCount" type="number" min="0" step="1" value="${escapeAttr(str.facilityCount ?? 0)}" ${strDisabled}>
          <div class="smallNote">Click "Edit Table" to enter area & floors for each facility.</div>
        </div>
        <div class="field">
          <label>&nbsp;</label>
          <button type="button" class="fullWidth" id="strEditBtn" ${strDisabled}>Edit Table</button>
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

    // BIM toggle: defer re-render to prevent stuck toggle
    $("bimRequired").onchange = e => {
      state.bimRequired = !!e.target.checked;
      requestAnimationFrame(() => {
        renderInputs();
        preview();
      });
    };

    // Architecture enable/disable
    $("archEnabled").onchange = e => {
      state.general.architecture.enabled = !!e.target.checked;
      requestAnimationFrame(() => {
        renderInputs();
        preview();
      });
    };

    // Structure enable/disable
    $("strEnabled").onchange = e => {
      state.general.structure.enabled = !!e.target.checked;
      requestAnimationFrame(() => {
        renderInputs();
        preview();
      });
    };

    // Facility counts
    const archCountEl = $("archFacilityCount");
    if (archCountEl) {
      archCountEl.oninput = e => {
        state.general.architecture.facilityCount = coerceInt(e.target.value, 0);
        normalizeFacilities(state.general.architecture);
        preview();
      };
    }

    const strCountEl = $("strFacilityCount");
    if (strCountEl) {
      strCountEl.oninput = e => {
        state.general.structure.facilityCount = coerceInt(e.target.value, 0);
        normalizeFacilities(state.general.structure);
        preview();
      };
    }

    // Edit tables (only if enabled)
    const archEditBtn = $("archEditBtn");
    if (archEditBtn) {
      archEditBtn.onclick = () => {
        if (!state.general.architecture.enabled) return;
        buildFacilityTableHtml("Architecture — Facilities Table", "architecture");
      };
    }

    const strEditBtn = $("strEditBtn");
    if (strEditBtn) {
      strEditBtn.onclick = () => {
        if (!state.general.structure.enabled) return;
        buildFacilityTableHtml("Structure — Facilities Table", "structure");
      };
    }

    // Checkbox delegation for Required/Wet/Dry/MEP/Landscape
    $("inputs").onchange = e => {
      const el = e.target;
      if (!(el instanceof HTMLInputElement)) return;
      if (el.type !== "checkbox") return;

      const kind = el.dataset.kind;
      const id = el.dataset.id;

      // Not delegated controls (Enable toggles handled above)
      if (!kind || !id) return;

      if (kind === "required") {
        state.requiredDetails[id] = el.checked;
        preview();
        return;
      }

      if (kind === "wet" || kind === "dry") {
        if (!state.disciplines[kind]) state.disciplines[kind] = {};
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
    if (jsonOut) jsonOut.textContent = JSON.stringify(state, null, 2);
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderInputs();
    preview();
  });
})();
