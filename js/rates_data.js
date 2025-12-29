// File: js/rates_data.js
(function () {
  const P = ["concept","schematic","detail","shop","asbuilt"];
  const mk = (cad,bim)=>({cad,bim});
  const wet = {
    concept: mk(30,15), schematic: mk(15,10), detail: mk(10,7.5), shop: mk(5,5), asbuilt: mk(15,20)
  };
  const scale = (r,f)=>P.reduce((o,k)=>(o[k]=mk(r[k].cad*f,r[k].bim*f),o),{});
  const landscape = {
    concept: mk(25,15), schematic: mk(15,10), detail: mk(6,5), shop: mk(3,4), asbuilt: mk(20,25)
  };
  const secIrr = {
    concept: mk(40,25), schematic: mk(25,18), detail: mk(12,10), shop: mk(6,7), asbuilt: mk(30,40)
  };
  const arch = {
    concept: mk(12000,8000), schematic: mk(7000,5000), detail: mk(3500,4000), shop: mk(2000,2800), asbuilt: mk(10000,14000)
  };
  const str = {
    concept: mk(16000,10000), schematic: mk(9000,6000), detail: mk(4500,5000), shop: mk(2500,3200), asbuilt: mk(12000,16000)
  };
  const mep = {
    concept: mk(10000,7000), schematic: mk(6000,4500), detail: mk(2500,3000), shop: mk(1500,2200), asbuilt: mk(8000,12000)
  };

  window.RatesData = {
    phases: P,
    wetKm: wet,
    roadsKm: scale(wet, 0.8),
    dryKm: scale(wet, 0.7),
    landscapeHa: landscape,
    secIrrHa: secIrr,
    archM2: arch,
    strM2: str,
    mepM2: mep
  };
})();
