// File: js/rates_data.js
// Output rates: how many units one engineer completes per month, per phase
// wet/dry/roads  → km  per engineer per month
// landscape/secIrr → ha per engineer per month
// arch/str/mep   → m²  per engineer per month
(function () {
  const mk = (cad, bim) => ({ cad, bim });

  const wetKm = {
    concept:   mk(30,   15),
    schematic: mk(15,   10),
    detail:    mk(10,   7.5),
    shop:      mk(5,    5),
    asbuilt:   mk(15,   20)
  };

  const scale = (r, f) => Object.fromEntries(
    Object.entries(r).map(([k, v]) => [k, mk(v.cad * f, v.bim * f)])
  );

  const landscapeHa = {
    concept:   mk(25,  15),
    schematic: mk(15,  10),
    detail:    mk(6,   5),
    shop:      mk(3,   4),
    asbuilt:   mk(20,  25)
  };

  const secIrrHa = {
    concept:   mk(40,  25),
    schematic: mk(25,  18),
    detail:    mk(12,  10),
    shop:      mk(6,   7),
    asbuilt:   mk(30,  40)
  };

  const archM2 = {
    concept:   mk(12000, 8000),
    schematic: mk(7000,  5000),
    detail:    mk(3500,  4000),
    shop:      mk(2000,  2800),
    asbuilt:   mk(10000, 14000)
  };

  const strM2 = {
    concept:   mk(16000, 10000),
    schematic: mk(9000,  6000),
    detail:    mk(4500,  5000),
    shop:      mk(2500,  3200),
    asbuilt:   mk(12000, 16000)
  };

  const mepM2 = {
    concept:   mk(10000, 7000),
    schematic: mk(6000,  4500),
    detail:    mk(2500,  3000),
    shop:      mk(1500,  2200),
    asbuilt:   mk(8000,  12000)
  };

  window.RatesData = {
    wetKm,
    roadsKm:     scale(wetKm, 0.8),
    dryKm:       scale(wetKm, 0.7),
    landscapeHa,
    secIrrHa,
    archM2,
    strM2,
    mepM2
  };
})();
