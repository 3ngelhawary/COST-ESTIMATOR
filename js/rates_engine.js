// File: js/rates_engine.js
//
// HOW DURATION IS CALCULATED (fixes the "more disciplines → lower cost" bug):
// ============================================================================
//
// WRONG old approach:
//   wet_duration = (km × wetCount) / (rate × totalWetEngineers)
//   → adding sub-disciplines both multiplied qty AND divided by more engineers,
//     so duration could stay flat or shrink while cost dropped.
//
// CORRECT new approach:
//   For each sub-discipline independently:
//     sub_duration = km / (rate × engineers_for_that_sub_disc)
//   Project duration = max across ALL sub-disciplines (critical path).
//   Adding a new sub-discipline adds a NEW work stream with its own junior,
//   so team grows AND the new stream may extend the critical path.
//   Cost = larger team × duration × rate  → always increases.
//
(function () {
  const { f } = window.UIH;

  function ratePick(tbl, phaseKey, wf) {
    if (!tbl) return 0;
    const k = String(phaseKey || "").toLowerCase();
    const row = tbl[k];
    if (row && typeof row[wf] === "number") return row[wf];
    return 0;
  }

  // Duration for ONE work stream: sum over selected phases of (qty / (rate × engineers))
  // Returns months. If any phase rate is 0 it is skipped (not that phase's scope).
  function streamDuration(qty, tbl, phases, wf, engineers) {
    if (!engineers || engineers <= 0 || qty <= 0 || !phases.length) return 0;
    let months = 0;
    phases.forEach(p => {
      const r = ratePick(tbl, p, wf);
      if (r > 0) months += qty / (r * engineers);
    });
    return months;
  }

  function selectedPhases(st) {
    return Object.entries(st.requiredDetails || {})
      .filter(([, v]) => v === true)
      .map(([k]) => k.toLowerCase());
  }

  function compute(st) {
    const wf     = st.bimRequired ? "bim" : "cad";
    const phases = selectedPhases(st);

    const lenM   = window.UIInputs.effectiveLength(st);
    const km     = f(lenM, 0) / 1000;
    const areaM2 = f(st.projectAreaSqm, 0);
    const ha     = areaM2 / 10000;
    const greenHa = (areaM2 * 0.35) / 10000;
    const facM2   = window.UIFacilityInfo.totalFacilityAreaM2(st);

    const A  = window.TeamModel.getActive(st);
    const rl = st.roadLandscape?.items || {};
    const rows = [];

    // ── Wet utilities: one row PER sub-discipline ──────────────────────────
    A.wetItems.forEach(subName => {
      const eng = window.TeamModel.engineersForKey(st, "wet", subName);
      const dur = streamDuration(km, window.RatesData.wetKm, phases, wf, eng);
      rows.push({ key: "wet", label: `Wet – ${subName}`, qty: km, unit: "km", eng, dur });
    });

    // ── Dry utilities: one row PER sub-discipline ──────────────────────────
    A.dryItems.forEach(subName => {
      const eng = window.TeamModel.engineersForKey(st, "dry", subName);
      const dur = streamDuration(km, window.RatesData.dryKm, phases, wf, eng);
      rows.push({ key: "dry", label: `Dry – ${subName}`, qty: km, unit: "km", eng, dur });
    });

    // ── Roads ──────────────────────────────────────────────────────────────
    if (A.roads) {
      const eng = window.TeamModel.engineersForKey(st, "roads", null);
      const dur = streamDuration(km, window.RatesData.roadsKm, phases, wf, eng);
      rows.push({ key: "roads", label: "Roads", qty: km, unit: "km", eng, dur });
    }

    // ── Landscape ─────────────────────────────────────────────────────────
    if (A.landscapeCount > 0) {
      const eng = window.TeamModel.engineersForKey(st, "landscape", null);
      const dur = streamDuration(ha, window.RatesData.landscapeHa, phases, wf, eng);
      rows.push({ key: "landscape", label: "Landscape", qty: ha, unit: "ha", eng, dur });
    }

    // ── Secondary Irrigation ──────────────────────────────────────────────
    if (A.secIrr) {
      const eng = window.TeamModel.engineersForKey(st, "secIrr", null);
      const dur = streamDuration(greenHa, window.RatesData.secIrrHa, phases, wf, eng);
      rows.push({ key: "secIrr", label: "Secondary Irrigation", qty: greenHa, unit: "ha", eng, dur });
    }

    // ── Architecture ──────────────────────────────────────────────────────
    if (A.arch) {
      const eng = window.TeamModel.engineersForKey(st, "arch", null);
      const dur = streamDuration(facM2, window.RatesData.archM2, phases, wf, eng);
      rows.push({ key: "arch", label: "Architecture", qty: facM2, unit: "m²", eng, dur });
    }

    // ── Structure ─────────────────────────────────────────────────────────
    if (A.str) {
      const eng = window.TeamModel.engineersForKey(st, "str", null);
      const dur = streamDuration(facM2, window.RatesData.strM2, phases, wf, eng);
      rows.push({ key: "str", label: "Structure", qty: facM2, unit: "m²", eng, dur });
    }

    // ── MEP ───────────────────────────────────────────────────────────────
    if (A.mepAny) {
      const eng = window.TeamModel.engineersForKey(st, "mep", null);
      const dur = streamDuration(facM2, window.RatesData.mepM2, phases, wf, eng);
      rows.push({ key: "mep", label: "MEP", qty: facM2, unit: "m²", eng, dur });
    }

    // Project duration = longest stream (critical path)
    const projectDuration = rows.length ? Math.max(...rows.map(r => r.dur)) : 0;
    return { rows, projectDuration };
  }

  window.RatesEngine = { compute };
})();
