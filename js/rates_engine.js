// File: js/rates_engine.js
(function () {
  const { f } = window.UIH;

  const isOn = (m)=>m && Object.values(m).some(v=>v===true);
  const selPhases = (st)=>Object.entries(st.requiredDetails||{}).filter(([,v])=>v).map(([k])=>k);

  const canon = (s)=>String(s||"").trim().toLowerCase();
  const usedMepSet = (st)=>{
    window.UIFacilityInfo.normalize(st);
    const set=new Set();
    (st.facilities||[]).forEach(r=>{
      if(!r.doMEP) return;
      Object.entries(r.mep||{}).forEach(([k,v])=>{ if(v===true) set.add(canon(k)); });
    });
    return set;
  };

  const mepGroups = [
    { key:"mepMech", label:"MEP - Mechanical", items:["hvac","fire fighting","firefighting","chiller"] },
    { key:"mepElec", label:"MEP - Electrical", items:["lighting","power","cctv"] },
    { key:"mepIct",  label:"MEP - ICA/ICT", items:["bms","data cabling","telephone"] },
    { key:"mepPlum", label:"MEP - Plumbing", items:["plumbing"] }
  ];

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

  function ratePick(tbl, phase, workflow){ return (tbl[phase]||{cad:0,bim:0})[workflow]; }

  function durOne(qtyVal, tbl, phases, workflow, eng){
    if (!eng || eng<=0) return Infinity;
    let sum=0;
    phases.forEach(p=>{
      const r=ratePick(tbl,p,workflow);
      if (r>0) sum += qtyVal/(r*eng);
    });
    return sum;
  }

  function compute(st){
    const workflow = st.bimRequired ? "bim" : "cad";
    const phases = selPhases(st);
    const Q = qty(st);

    const active = {
      wet: isOn(st.disciplines?.wet),
      dry: isOn(st.disciplines?.dry),
      roads: (st.roadLandscape?.items||{})["Roads"]===true,
      landscape: ["Master Planning","Sub-Soil Drainage"].some(k=>(st.roadLandscape?.items||{})[k]===true),
      secIrr: (st.roadLandscape?.items||{})["Secondary Irrigation"]===true
    };

    const fac = st.facilities||[];
    active.arch = fac.some(r=>r.doArch);
    active.str  = fac.some(r=>r.doStruct);

    const mepUsed = usedMepSet(st);
    const mepActive = mepGroups.reduce((o,g)=>(
      o[g.key]=g.items.some(x=>mepUsed.has(canon(x))), o
    ),{});
    active.mep = Object.values(mepActive).some(v=>v);

    // engineers editable (state store)
    if (!st.durationEngineers) st.durationEngineers = {};
    const E = (k, def)=>Math.max(0, parseInt(st.durationEngineers[k] ?? def,10) || 0);

    const rows = [];
    const push = (k,label,qtyVal,tbl,defE)=>{
      if (!active[k] || phases.length===0) return;
      const e=E(k,defE);
      const d=durOne(qtyVal,tbl,phases,workflow,e);
      rows.push({ key:k, label, qty:qtyVal, unit:"", eng:e, dur:d });
    };

    push("wet","Wet Utilities", Q.km, window.RatesData.wetKm, 1);
    push("dry","Dry Utilities", Q.km, window.RatesData.dryKm, 1);
    push("roads","Roads", Q.km, window.RatesData.roadsKm, 1);
    push("landscape","Landscape", Q.ha, window.RatesData.landscapeHa, 1);
    push("secIrr","Secondary Irrigation", Q.greenHa, window.RatesData.secIrrHa, 1);
    push("arch","Architecture", Q.m2, window.RatesData.archM2, 1);
    push("str","Structure", Q.m2, window.RatesData.strM2, 1);

    // MEP as one discipline duration (rates table), engineers are total MEP engineers
    if (active.mep && phases.length){
      const e = E("mep", 1);
      const d = durOne(Q.m2, window.RatesData.mepM2, phases, workflow, e);
      rows.push({ key:"mep", label:"MEP (All)", qty:Q.m2, unit:"", eng:e, dur:d });
    }

    const maxDur = rows.length ? Math.max(...rows.map(r=>r.dur)) : 0;
    return { workflow, phases, rows, projectDuration: (Number.isFinite(maxDur)?maxDur:0) };
  }

  window.RatesEngine = { compute };
})();
