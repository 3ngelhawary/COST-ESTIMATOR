// File: js/pricing_engine.js v40
(function () {
  const HOURS_PER_PERSON_PER_MONTH = 200;

  function num(x, d) {
    d = d || 0;
    var n = parseFloat(String(x == null ? '' : x).replace(/,/g, '').trim());
    return isFinite(n) ? n : d;
  }

  function compute(teamRoles, durationMonths, avgManHourCost, overheadPct, contingencyPct) {
    var dur  = Math.max(0, num(durationMonths, 0));
    var rate = Math.max(0, num(avgManHourCost, 0));
    var oPct = Math.max(0, num(overheadPct, 0));
    var cPct = Math.max(0, num(contingencyPct, 0));

    var rows = (teamRoles || [])
      .map(function(r) { return { role: String(r.role || '').trim(), qty: Math.max(0, Math.round(num(r.qty, 0))) }; })
      .filter(function(r) { return r.role && r.qty > 0; })
      .map(function(r) {
        var mhPerMonth   = r.qty * HOURS_PER_PERSON_PER_MONTH;
        var costPerMonth = mhPerMonth * rate;
        var total        = costPerMonth * dur;
        return Object.assign({}, r, { mhPerMonth: mhPerMonth, costPerMonth: costPerMonth, total: total });
      });

    var totalStaff     = rows.reduce(function(s,r){return s+r.qty;}, 0);
    var totalMHMonth   = rows.reduce(function(s,r){return s+r.mhPerMonth;}, 0);
    var totalCostMonth = rows.reduce(function(s,r){return s+r.costPerMonth;}, 0);
    var directCost     = rows.reduce(function(s,r){return s+r.total;}, 0);
    var overhead       = directCost * (oPct / 100);
    var subtotal       = directCost + overhead;
    var contingency    = subtotal   * (cPct / 100);
    var grandTotal     = subtotal   + contingency;

    return {
      hoursPerPersonPerMonth: HOURS_PER_PERSON_PER_MONTH,
      durationMonths: dur,
      rate: rate,
      overheadPct: oPct,
      contingencyPct: cPct,
      totalStaff: totalStaff,
      totalMHMonth: totalMHMonth,
      totalCostMonth: totalCostMonth,
      directCost: directCost,
      overhead: overhead,
      subtotal: subtotal,
      contingency: contingency,
      grandTotal: grandTotal,
      rows: rows
    };
  }

  window.PricingEngine = { compute: compute };
})();
