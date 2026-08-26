# Brief

> Ideally, we are looking for a fully functional Platform both on landing and post log in use.

## Product

**KolaboLab** — a startup collaboration platform connecting **entrepreneurs, collaborators, and
investors**. Accessibility-first (WCAG 2.2 AA), bias-free matching, global/inclusive positioning.

## Scope (both halves must be real)

### 1. Landing (unauthenticated)
The public marketing surface. Must sell the product to three distinct audiences without becoming a
generic SaaS template. Hero, value prop, how-it-works, social proof, CTA to sign up.

### 2. Post-login (authenticated)
The actual product. Not a stub, not a "coming soon" shell. A signed-in user must be able to move
through real surfaces with real-looking data:
- Dashboard (the daily home)
- Discovery / matching (find startups, collaborators, investors)
- Profile / startup detail
- Collaboration + investment surfaces
- Auth flow that actually completes (login -> authenticated app -> logout)

## Non-negotiables

1. **Design direction is set.** Branch `experiment/design-system-innovators-hub` established the
   "Ink & Iris" system: near-black ink primary, electric iris accent, lime signal, Space Grotesk
   display + Inter body, hairline borders, crisp shadows. Build ON this. Do not restart the palette.
2. **WCAG 2.2 AA holds.** Contrast is enforced by property tests. Accent 500 is for text/decoration;
   white-text fills use 600+. 44px minimum tap targets.
3. **Token-first.** Visual decisions live in the theme. Page-level hardcoded hexes are a defect.
4. **No net test regressions.** Baseline is 95 pre-existing failures; that number must not grow.
5. **Real content.** No lorem ipsum, no grey placeholder blobs, no fake logo rectangles. Copy must
   read like a real product; imagery must be real images.

## Definition of done

A reviewer can open the local URL, browse the landing page, log in, and click through the
authenticated product — and it looks like a design-award-caliber product rather than a template.
