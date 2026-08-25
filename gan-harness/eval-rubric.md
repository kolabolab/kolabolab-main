# Eval Rubric — Design Mode

Weighted 0–10 per category. **Pass threshold: 7.5 weighted.** Max iterations: 10.

The Evaluator's central question is **"would this win a design award?"** — not "do all features
work?" A stunning half-finished surface beats a complete ugly one.

**Evaluation must be visual.** Scores are assigned from rendered screenshots, not from reading
source code. A score given without looking at a rendered image is invalid.

---

### Design Quality (weight: 0.35)

- Does the composition have a clear focal hierarchy, or does everything shout equally?
- Is the type doing real work — scale contrast, tracking, measure — or is it all one grey size?
- Is whitespace deliberate and rhythmic, or is it uniform padding everywhere?
- Does light/dark mode both feel intentional, or is one an afterthought?
- Colour: is the accent used with restraint and intent, or sprayed?
- **Slop tells (each costs points):** centered-everything, three identical feature cards with
  generic icons, evenly-spaced full-width sections, gradient-on-everything, unmotivated glassmorphism.

### Originality (weight: 0.30)

- Would a designer screenshot this, or has it been seen a thousand times?
- Is there at least one **memorable, specific** idea — an unusual layout, a signature motion, a
  distinctive editorial device — that belongs to *this* product?
- Does it look like KolaboLab specifically, or like any B2B SaaS with the colours swapped?
- Bonus for creative leaps: asymmetry that works, unexpected navigation, custom data visualisation,
  typographic risk that lands.
- Penalty for template smell, even a well-executed template.

### Craft (weight: 0.25)

- Alignment, optical spacing, consistent radii/borders/shadows across surfaces.
- Motion: purposeful, interruptible, `prefers-reduced-motion` respected.
- Responsive: does it survive narrow widths, or does it just shrink?
- Accessibility as craft: focus states visible, contrast AA, 44px targets, real semantics.
- Empty/loading/error states designed, not defaulted.
- Token discipline: no page-level hardcoded hexes.

### Functionality (weight: 0.10)

- Landing renders and navigates.
- Login completes and lands in the authenticated app.
- Post-login surfaces render with realistic data (not spinners, not error toasts, not blank).
- No console errors that break a surface.

---

## Scoring log format

Each iteration appends to `gan-harness/scores.md`:

```
## Iteration N
| Category | Weight | Score | Weighted |
|---|---|---|---|
| Design Quality | 0.35 | x.x | x.xx |
| Originality | 0.30 | x.x | x.xx |
| Craft | 0.25 | x.x | x.xx |
| Functionality | 0.10 | x.x | x.xx |
| **TOTAL** | | | **x.xx** |

**Verdict:** PASS / ITERATE
**Evidence:** (screenshots reviewed)
**Top 3 fixes for next iteration:** ...
```
