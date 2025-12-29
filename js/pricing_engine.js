// File: js/pricing_engine.js
(function () {
  const HOURS_PER_PERSON_PER_MONTH = 200;

  function num(x, d = 0) {
    const n = parseFloat(String(x ?? "").replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : d;
  }

  function compute(teamRoles, durationMonths, avgManHourCost) {
    const dur = Math.max(0, num(durationMonths, 0));
    const rate = Math.max(0, num(avgManHourCost, 0));

    const rows = (teamRoles || [])
      .map(r => ({
        role: String(r.role ?? "").trim(),
        qty: Math.max(0, Math.round(num(r.qty, 0)))
      }))
      .filter(r => r.role && r.qty > 0)
      .map(r => {
        const mhPerMonth = r.qty * HOURS_PER_PERSON_PER_MONTH;
        const costPerMonth = mhPerMonth * rate;
        const total = costPerMonth * dur;
        return { ...r, mhPerMonth, costPerMonth, total };
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
