const MULTIPLIERS = {
  projectType: {
    pipeline: 1.0,
    pumpStation: 1.2,
    reservoir: 1.1,
    mixed: 1.3
  },
  stage: {
    concept: 0.25,
    schematic: 0.45,
    detailed: 0.85,
    ifc: 1.0
  },
  complexity: {
    low: 0.85,
    normal: 1.0,
    high: 1.25,
    extreme: 1.5
  }
};

const DEFAULTS = {
  baseFee: 200000,
  overheadPct: 15,
  profitPct: 10,
  currency: "SAR"
};
