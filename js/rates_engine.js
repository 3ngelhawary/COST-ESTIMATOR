// File: js/rates_engine.js
(function () {
  const { f } = window.UIH;

  const isOn = (m) => m && Object.values(m).some(v => v === true);

  const num = (x, d = 0) => {
    const n = parseFloat(String(x ?? "").replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : d;
  };

  function selectedPhases(st) {
    return Object.entries(st.requiredDetails || {})
      .filter(([, v]) => v === true)
      .map(([k]) => String(k || "").trim().toLowerCase()); // concept/schematic/detail/shop/asbuilt
  }

  function ratePick(tbl, phaseKey, wf) {
    if (!tbl) return 0;
    const k = String(phaseKey || "").trim().toLowerCase();

    // lower-case keys
    if (tbl[k] && typeof tbl[k][wf] === "number") return tbl[k][wf];

    // title-case keys
    const titleMap = { concept: "Concept", schematic: "Schematic", detail: "Detailed", shop: "Shop", asbuilt: "As-Built" };
    const t = titleMap[k];
    if (t && tbl[t] && typeof tbl[t][wf] === "number") return tbl[t][wf];

    // alt
    if (k === "asbuilt" && tbl["AsBuilt"] && typeof tbl["AsBuilt"][wf] === "number") return tbl["AsBuilt"][wf];
    return 0;
  }

  function facilitiesAreaM2(st) {
    let a = 0;
    (st.facilities || []).forEach(r => {
      a += num(r.count, 0) * num(r.floors, 1) * num(r.area, 0);
    });
    return a;
  }

  function counts(st) {
    const wetCount = Object.values(st.disciplines?.wet || {}).filter(v => v === true).length;
    const dryCount = Object.values(st.disciplines?.dry || {}).filter(v => v === true).length;

    const rl = st.roadLandscape?.items || {};
    const roadsCount = rl["Roads"] === true ? 1 : 0;
    const landscapeCount = ["Master Planning", "Sub-Soil Drainage"].filter(k => rl[k] === true).length;

    return { wetCount, dryCount, roadsCount, landscapeCount };
  }

  function quantities(st) {
    const lenM = window.UIInputs.effectiveLength(st);
    const areaM2 = f(st.projectAreaSqm, 0);

    return {
      km: f(lenM, 0) / 1000,
      ha: areaM2 / 10000,
      greenHa: (areaM2 * 0.35) / 10000,
      facilitiesM2: facilitiesAreaM2(st)
    };
  }

  function durOne(qty, tbl, phases, wf, eng) {
    if (!eng || eng <= 0) return Infinity;
    let sum = 0;
    phases.forEach(p => {
      const r = ratePick(tbl, p, wf);
      if (r > 0) sum += qty / (r * eng);
    });
    return sum;
  }

  function compute(st) {
    const wf = st.bimRequired ? "bim" : "cad";
    const phases = selectedPhases(st);
    const Q = quantities(st);
    const C = counts(st);

    const rl = st.roadLandscape?.items || {};
    const fac = st.facilities || [];

    const active = {
      wet: C.wetCount > 0,
      dry: C.dryCount > 0,
      roads: C.roadsCount > 0,
      landscape: C.landscapeCount > 0,
      secIrr: rl["Secondary Irrigation"] === true,
      arch: fac.some(r => r.doArch),
      str: fac.some(r => r.doStruct),
      mep: window.TeamModel.getActive(st).mepAny
    };

    const rows = [];
    const add = (key, label, qty, tbl) => {
      if (!active[key] || !phases.length) return;
      const eng = window.TeamModel.engineersFor(st, key);
      const dur = durOne(qty, tbl, phases, wf, eng);
      rows.push({ key, label, qty, dur });
    };

    // ✅ each sub-discipline reflected by multiplying quantity
    add("wet", "Wet Utilities", Q.km * C.wetCount, window.RatesData.wetKm);
    add("dry", "Dry Utilities", Q.km * C.dryCount, window.RatesData.dryKm);
    add("roads", "Roads", Q.km * C.roadsCount, window.RatesData.roadsKm);
    add("landscape", "Landscape", Q.ha * C.landscapeCount, window.RatesData.landscapeHa);

    add("secIrr", "Secondary Irrigation", Q.greenHa, window.RatesData.secIrrHa);

    // facilities-based
    add("arch", "Architecture", Q.facilitiesM2, window.RatesData.archM2);
    add("str", "Structure", Q.facilitiesM2, window.RatesData.strM2);
    add("mep", "MEP", Q.facilitiesM2, window.RatesData.mepM2);

    const projectDuration = rows.length ? Math.max(...rows.map(r => r.dur)) : 0;
    return { rows, projectDuration };
  }

  window.RatesEngine = { compute };
})();
