// File: js/rates_engine.js
(function () {
  const { f } = window.UIH;

  const PHASE_MAP = {
    concept: "Concept",
    schematic: "Schematic",
    detail: "Detailed",
    shop: "Shop",
    asbuilt: "As-Built"
  };

  const isOn = (m) => m && Object.values(m).some(v => v === true);

  function selectedPhases(st) {
    return Object.entries(st.requiredDetails || {})
      .filter(([, v]) => v)
      .map(([k]) => PHASE_MAP[k])
      .filter(Boolean);
  }

  const ratePick = (tbl, phase, wf) =>
    (tbl[phase] || { cad: 0, bim: 0 })[wf];

  function quantities(st) {
    const lenM = window.UIInputs.effectiveLength(st);
    const areaM2 = f(st.projectAreaSqm, 0);

    let facilitiesArea = 0;
    (st.facilities || []).forEach(r => {
      facilitiesArea +=
        f(r.count, 0) *
        f(r.floors, 1) *
        f(r.area, 0);
    });

    return {
      km: lenM / 1000,
      ha: areaM2 / 10000,
      greenHa: (areaM2 * 0.35) / 10000,
      facilitiesM2: facilitiesArea
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

    const rl = st.roadLandscape?.items || {};
    const fac = st.facilities || [];

    const active = {
      wet: isOn(st.disciplines?.wet),
      dry: isOn(st.disciplines?.dry),
      roads: rl["Roads"] === true,
      landscape: ["Master Planning", "Sub-Soil Drainage"].some(k => rl[k] === true),
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

    add("wet", "Wet Utilities", Q.km, window.RatesData.wetKm);
    add("dry", "Dry Utilities", Q.km, window.RatesData.dryKm);
    add("roads", "Roads", Q.km, window.RatesData.roadsKm);
    add("landscape", "Landscape", Q.ha, window.RatesData.landscapeHa);
    add("secIrr", "Secondary Irrigation", Q.greenHa, window.RatesData.secIrrHa);
    add("arch", "Architecture", Q.facilitiesM2, window.RatesData.archM2);
    add("str", "Structure", Q.facilitiesM2, window.RatesData.strM2);
    add("mep", "MEP", Q.facilitiesM2, window.RatesData.mepM2);

    const projectDuration =
      rows.length ? Math.max(...rows.map(r => r.dur)) : 0;

    return { rows, projectDuration };
  }

  window.RatesEngine = { compute };
})();
