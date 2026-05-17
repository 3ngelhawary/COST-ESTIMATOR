# Design Cost Estimator v40

Engineering project design cost estimator with full pricing breakdown.

## Whats new in v40
- Industrial-precision dashboard design (Barlow + DM Mono fonts)
- Currency selector (USD, EUR, GBP, AED, EGP, SAR, QAR)
- Overhead % and Contingency % fields with full cost breakdown
- Cost per m² KPI
- Schedule health bar (visual %)
- Critical path highlighting in duration table
- Collapsible output sections
- CSV export with full breakdown
- Print view
- Animated KPIs, improved empty states
- All v30 logic fixes retained (per-sub-discipline streams, no recursion)

## Logic (unchanged from v30)
Each wet/dry sub-discipline = independent work stream with dedicated junior engineer.
Adding sub-disciplines → larger team + potential critical path extension → cost always increases.
