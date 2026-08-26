# KolaboLab Design System — "Ink & Iris" (Experiment)

**Branch:** `experiment/design-system-innovators-hub`
**Status:** Experiment — local review before any production decision.

## Why

The previous navy/cyan theme was competent but generic. This experiment adopts the
design language of the current generation of successful innovation platforms
(Wellfound, Linear, Mercury): high-contrast ink primaries, one electric accent,
editorial display type, hairline borders and crisp shadows instead of heavy
glassmorphism. The goal: KolaboLab should *look* like the place where serious
founders, collaborators and investors meet.

## Principles

1. **Token-first.** Every visual decision lives in tokens. Components consume
   tokens; pages consume components. The entire re-skin shipped with almost no
   page-level changes.
2. **Contract-compatible.** All scale names (`brand`, `accent`, `success`,
   `gray`, `blue`, `neutral`), semantic tokens, and component variant names are
   unchanged. Rollback = revert one branch.
3. **One accent at a time.** Iris is the only interactive accent. Lime (`signal`)
   is reserved for celebratory highlights and marketing pops — never for actions.
4. **Role colors are sacred.** Startup orange `#FF9500` and investor green
   `#52C41A` are functional identity colors and are intentionally untouched.

## Tokens

### Color

| Scale | 500 | Role |
|---|---|---|
| `brand` (Ink) | `#232838` | Primary actions, headers, emphasis surfaces |
| `accent` (Iris) | `#6B6EF2` | Links, focus rings, interactive accents |
| `signal` (Lime) — new | `#B7E51D` | Badges, highlights, celebratory moments |
| `success` | `#10B981` | Success semantics only (unchanged) |
| `gray` / `blue` / `neutral` | — | Unchanged |

Semantic tokens (`bg-base`, `bg-surface`, `text-primary`, `border-subtle`, …)
keep their names; values moved from blue-tinted glass to neutral paper:
`bg-base` is now `#FAFAFB` (light) / `#0B0C11` (dark), surfaces are solid with
hairline borders (`rgba(9,10,15,0.08)`).

### Typography

- **Display/Headings:** Space Grotesk (600–700), tracking `-0.02em`
- **Body/UI:** Inter (400–600)
- Poppins is removed. (Note: it was referenced by the old theme but never
  actually loaded in `index.html` — headings were silently falling back to
  system-ui.)

### Shape & Depth

- Radii: controls `10px`, cards `20px`, badges/tags pill.
- Shadows: 4-step crisp scale (`0 1px 2px` → `0 24px 48px -12px`), plus an
  iris `outline` focus ring (`0 0 0 3px rgba(107,110,242,0.4)`).
- Glass effects survive only in the explicit `glass` variants.

## Component recipes (highlights)

- **Button** — `solid`/`primary`: ink, inverts to white-on-ink in dark mode
  (`primary` previously didn't exist even though pages used it — fixed).
  `secondary`: iris subtle. `asymmetric`: signature ink→iris gradient with an
  asymmetric corner (`12px 12px 12px 2px`). `glass`, `outline`,
  `outline-secondary`, `ghost`, `success`, `link` all re-skinned.
- **Card** — solid surface + hairline border; `elevated` hover-lifts;
  `primary`/`secondary`/`success` left-accent rails (iris/lime/green); `glass`
  keeps blur.
- **Forms** — iris focus ring on all fields; selection controls default to the
  `accent` scheme.
- **Table/Tabs/Menu/Modal/Tooltip** — quieter chrome, hairline dividers,
  uppercase micro-labels for table headers.

## Where the tokens live

| Layer | File |
|---|---|
| Chakra theme (canonical) | `src/theme/index.ts` |
| CSS custom properties | `src/styles/index.css` (`--ink-*`, `--iris-*`, `--lime-*`; legacy `--primary-navy`/`--accent-cyan` alias to the new values) |
| Alpha helpers | `src/utils/themeColors.ts` |
| Splash + meta theme-color | `index.html` |

## Test posture

Palette pins in `theme.test.ts`, `theme.property.test.ts`,
`themeColors.property.test.ts`, `theme-integration.test.tsx` and the
preservation suites were updated to the new brand decision; structural
invariants (full 50–900 scales, variant contracts, role-color preservation,
semantic token shape) are unchanged and still enforced.
