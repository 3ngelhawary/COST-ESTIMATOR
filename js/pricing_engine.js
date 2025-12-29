// File: js/pricing_engine.js
(function () {
  const { f } = window.UIH;

  const HOURS_PER_PERSON_PER_MONTH = 200;

  function compute(teamRoles, durationMonths, avgManHourCost) {
    const dur = Math.max(0, f(durationMonths, 0));
    const rate = Math.max(0, f(avgManHourCost, 0));

    const rows = (teamRoles || [])
      .filter(r => f(r.qty, 0) > 0)
      .map(r => {
        const qty = f(r.qty, 0);
        const mhPerMonth = qty * HOURS_PER_PERSON_PER_MONTH;
        const costPerMonth = mhPerMonth * rate;
        const total = costPerMonth * dur;
        return { role: r.role, qty, mhPerMonth, costPerMonth, total };
      });

    const totalStaff = rows.reduce((s, r) => s + r.qty, 0);
    const totalMHMonth = rows.reduce((s, r) => s + r.mhPerMonth, 0);
    const totalCostMonth = rows.reduce((s, r) => s + r.costPerMonth, 0);
    const totalCost = rows.reduce((s, r) => s + r.total, 0);

    return {
      hoursPerPersonPerMonth: HOURS_PER_PERSON_PER_MONTH,
      durationMonths: dur,
      avgManHourCost: rate,
      totalStaff,
      totalMHMonth,
      totalCostMonth,
      totalCost,
      rows
    };
  }

  window.PricingEngine = { compute };
})();
