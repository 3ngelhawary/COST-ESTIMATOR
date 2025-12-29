// File: js/config.js
window.APP_CONFIG = {
  currencySymbol: "$",
  drawingScales: ["1:1000", "1:500", "1:250", "1:100"],
  requiredDetailNonBim: [
    { id: "concept", label: "Concept Design" },
    { id: "schematic", label: "Schematic Design" },
    { id: "detail", label: "Detail Design" },
    { id: "shop", label: "Shop Drawing" },
    { id: "asbuilt", label: "As-Built" }
  ],
  requiredDetailBim: [
    { id: "concept", label: "Concept Design", sub: "LOD 100" },
    { id: "schematic", label: "Schematic Design", sub: "LOD 200" },
    { id: "detail", label: "Detail Design", sub: "LOD 300" },
    { id: "shop", label: "Shop Drawing", sub: "LOD 400" },
    { id: "asbuilt", label: "As-Built", sub: "LOD 500" }
  ],
  disciplines: {
    wet: ["Potable Water", "Sewage", "Storm", "Irrigation", "Fire Fighting"],
    dry: ["Low Voltage", "Medium Voltage", "High Voltage", "ICA", "ICT"]
  },
  mepSystems: ["Lighting","HVAC","Chiller","Plumbing","Firefighting","Power","Data cabling","CCTV","Telephone","BMS"],
  facilityTypes: ["Tank","Sump","Chamber","Building"],
  roadLandscapeItems: ["Master Planning","Roads","Secondary Irrigation","Sub-Soil Drainage"]
};

window.DEFAULT_STATE = {
  projectName: "",
  projectAreaSqm: "",
  durationMonths: "",
  drawingScale: "1:1000",
  bimRequired: false,
  lengthOverride: false,
  projectLengthManual: "",
  requiredDetails: { concept:false, schematic:false, detail:false, shop:false, asbuilt:false },
  disciplines: { wet:{}, dry:{} },
  roadLandscape: { items:{} },
  facilities: []
};
