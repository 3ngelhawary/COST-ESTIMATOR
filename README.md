# Design Cost Estimator

Engineering project cost estimator for infrastructure, utilities, and facilities design.

## Files
- `index.html` — main entry point
- `css/style.css` — all styles and CSS variables
- `css/output.css` — card color accents
- `js/` — modular JavaScript engines

## Key fixes in this version
- **Duration calculation**: each sub-discipline (Potable Water, Sewage, etc.) is now an independent work stream with its own junior engineer. Adding more sub-disciplines adds team members AND may extend the critical path — cost always increases correctly.
- **CSS variables**: single consolidated `style.css` defines all `--text`, `--muted`, `--focus`, `--line` etc. variables.
- **No recursion**: auto-staff uses a single-pass loop, not mutual recursion between engines.
- **Engineers column**: duration breakdown shows how many engineers are on each stream.
