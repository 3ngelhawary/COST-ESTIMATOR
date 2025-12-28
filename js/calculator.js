// File: js/calculator.js
function buildInputPayload(state) {
  const area = Number(state.projectAreaSqm);
  const projectAreaSqm = Number.isFinite(area) ? area : 0;

  const requiredDetailSelected = Object.entries(state.requiredDetails)
    .filter(([, v]) => v === true)
    .map(([k]) => k);

  const wetSelected = Object.entries(state.disciplines.wet)
    .filter(([, v]) => v === true)
    .map(([k]) => k);

  const drySelected = Object.entries(state.disciplines.dry)
    .filter(([, v]) => v === true)
    .map(([k]) => k);

  return {
    currency: APP_CONFIG.currencySymbol,
    projectName: (state.projectName || "").trim(),
    projectAreaSqm,
    bimRequired: !!state.bimRequired,
    requiredDetailSelected,
    disciplines: { wetSelected, drySelected }
  };
}
