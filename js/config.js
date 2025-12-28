// File: js/config.js

// Expose config globally (required for GitHub Pages runtime)
window.APP_CONFIG = {
  currencySymbol: "$",

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
    wet: [
      { id: "pw", label: "Potable Water" },
      { id: "sew", label: "Sewage" },
      { id: "stm", label: "Storm" },
      { id: "irr", label: "Irrigation" },
      { id: "ff", label: "Fire Fighting" }
    ],
    dry: [
      { id: "lv", label: "Low Voltage" },
      { id: "mv", label: "Medium Voltage" },
      { id: "hv", label: "High Voltage" },
      { id: "ica", label: "ICA" },
      { id: "ict", label: "ICT" }
    ]
  }
};

window.DEFAULT_STATE = {
  projectName: "",
  projectAreaSqm: "",
  bimRequired: false,

  requiredDetails: {
    concept: false,
    schematic: false,
    detail: false,
    shop: false,
    asbuilt: false
  },

  disciplines: {
    wet: { pw: false, sew: false, stm: false, irr: false, ff: false },
    dry: { lv: false, mv: false, hv: false, ica: false, ict: false }
  }
};
