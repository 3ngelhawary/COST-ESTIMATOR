function calculateDesignFee(input) {
  const {
    baseFee,
    projectType,
    stage,
    complexity
  } = input;

  return baseFee *
    MULTIPLIERS.projectType[projectType] *
    MULTIPLIERS.stage[stage] *
    MULTIPLIERS.complexity[complexity];
}

function calculateTotal(designFee, overheadPct, profitPct, expenses) {
  const overhead = designFee * overheadPct / 100;
  const profit = (designFee + overhead) * profitPct / 100;
  return designFee + overhead + profit + expenses;
}
