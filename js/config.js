// File: js/config.js v40
window.APP_CONFIG = {
  currencies: [
    { sym:'$',   code:'USD', label:'USD — US Dollar' },
    { sym:'€',   code:'EUR', label:'EUR — Euro' },
    { sym:'£',   code:'GBP', label:'GBP — British Pound' },
    { sym:'AED', code:'AED', label:'AED — UAE Dirham' },
    { sym:'EGP', code:'EGP', label:'EGP — Egyptian Pound' },
    { sym:'SAR', code:'SAR', label:'SAR — Saudi Riyal' },
    { sym:'QAR', code:'QAR', label:'QAR — Qatari Riyal' }
  ],
  drawingScales: ['1:5000','1:2000','1:1000','1:500','1:250','1:100'],
  requiredDetailNonBim: [
    { id:'concept',   label:'Concept Design' },
    { id:'schematic', label:'Schematic Design' },
    { id:'detail',    label:'Detail Design' },
    { id:'shop',      label:'Shop Drawing' },
    { id:'asbuilt',   label:'As-Built' }
  ],
  requiredDetailBim: [
    { id:'concept',   label:'Concept Design',   sub:'LOD 100' },
    { id:'schematic', label:'Schematic Design',  sub:'LOD 200' },
    { id:'detail',    label:'Detail Design',     sub:'LOD 300' },
    { id:'shop',      label:'Shop Drawing',      sub:'LOD 400' },
    { id:'asbuilt',   label:'As-Built',          sub:'LOD 500' }
  ],
  disciplines: {
    wet: ['Potable Water','Sewage','Storm','Irrigation','Fire Fighting'],
    dry: ['Low Voltage','Medium Voltage','High Voltage','ICA','ICT']
  },
  mepSystems: ['Lighting','HVAC','Chiller','Plumbing','Fire Fighting','Power','Data Cabling','CCTV','Telephone','BMS'],
  facilityTypes: ['Tank','Sump','Chamber','Pump Station','Building','Substation'],
  roadLandscapeItems: ['Master Planning','Roads','Secondary Irrigation','Sub-Soil Drainage']
};

window.DEFAULT_STATE = {
  projectName:       '',
  projectAreaSqm:    '',
  durationMonths:    '',
  drawingScale:      '1:1000',
  bimRequired:       false,
  currencySym:       '$',
  avgManHourCost:    5.00,
  overheadPct:       15,
  contingencyPct:    10,
  lengthOverride:    false,
  projectLengthManual: '',
  requiredDetails: { concept:true, schematic:true, detail:true, shop:true, asbuilt:true },
  disciplines:    { wet:{}, dry:{} },
  roadLandscape:  { items:{} },
  facilities:     [],
  teamOverrides:  {},
  autoJuniorLevel: 1,
  _juniorManual:   false
};
