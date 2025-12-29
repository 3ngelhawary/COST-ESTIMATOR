// File: js/rates_engine.js
(function () {
  const { f } = window.UIH;

  const isOn = (m)=>m && Object.values(m).some(v=>v===true);
  const selPhases = (st)=>Object.entries(st.requiredDetails||{}).filter(([,v])=>v).map(([k])=>k);
  const ratePick = (tbl, phase, wf)=> (tbl[phase]||{cad:0,bim:0})[wf];

  function qty(st){
    const lenM = window.UIInputs.effectiveLength(st);
    const areaM2 = f(st.projectAreaSqm,0);
    return {
      km: f(lenM,0)/1000,
      ha: areaM2/10000,
      greenHa: (areaM2*0.35)/10000,
      m2: areaM2
    };
  }

  function durOne(qtyVal, tbl, phases, wf, eng){
    if (!eng || eng<=0) return Infinity;
    let sum=0;
    phases.forEach(p=>{
      const r=ratePick(tbl,p,wf);
      if (r>0) sum += qtyVal/(r*eng);
    });
    return sum;
  }

  function compute(st){
    const wf = st.bimRequired ? "bim" : "cad";
    const phases = selPhases(st);
    const Q = qty(st);

    const rl = st.roadLandscape?.items || {};
    const fac = st.facilities||[];

    const active = {
      wet: isOn(st.disciplines?.wet),
      dry: isOn(st.disciplines?.dry),
      roads: rl["Roads"]===true,
      landscape: ["Master Planning","Sub-Soil Drainage"].some(k=>rl[k]===true),
      secIrr: rl["Secondary Irrigation"]===true,
      arch: fac.some(r=>r.doArch),
      str: fac.some(r=>r.doStruct),
      mep: TeamModel.getActive(st).mepAny
    };

    const rows = [];
    const add = (key,label,qtyVal,tbl)=>{
      if (!active[key] || phases.length===0) return;
      const eng = TeamModel.engineersFor(st, key);
      const dur = durOne(qtyVal,tbl,phases,wf,eng);
      rows.push({ key,label,qty:qtyVal,eng,dur });
    };

    add("wet","Wet Utilities", Q.km, window.RatesData.wetKm);
    add("dry","Dry Utilities", Q.km, window.RatesData.dryKm);
    add("roads","Roads", Q.km, window.RatesData.roadsKm);
    add("landscape","Landscape", Q.ha, window.RatesData.landscapeHa);
    add("secIrr","Secondary Irrigation", Q.greenHa, window.RatesData.secIrrHa);
    add("arch","Architecture", Q.m2, window.RatesData.archM2);
    add("str","Structure", Q.m2, window.RatesData.strM2);
    add("mep","MEP", Q.m2, window.RatesData.mepM2);

    const maxDur = rows.length ? Math.max(...rows.map(r=>r.dur)) : 0;
    return { workflow:wf, phases, rows, projectDuration: (Number.isFinite(maxDur)?maxDur:0) };
  }

  window.RatesEngine = { compute };
})();
