# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable design decisions

- Brand is **Stick'Arts / Comstore**. Navbar logo: `public/assets/logo-black.png`. Footer logo: `public/assets/logo-white.png`.
- Visual system from the Stick'Art mock: white paper, charcoal `#1c1c1c`, gold accent `#c9a227`. Display/body: Outfit; script accent: Great Vibes (hero “créativité”).
- Hero left copy matches the Stick'Art detail mock: gold kicker with a short rule to its right, white headline with gold italic “créativité.”, two body paragraphs, gold primary + ghost secondary CTAs, then a compact trust row directly under the buttons (content-width only, not full-bleed). Right aside uses Caveat marker script, left-aligned, white, rotated ~-11°, with soft shadow (“Votre design / format / finition”).
- Navbar **Nos solutions** opens the dedicated `/solutions` page (not an in-page scroll). Home still includes the solutions section.
- `/solutions` page layout: dark printer hero (“Des stickers pour chaque besoin”) + trust strip → “Nos solutions par usage” 8-card grid → UV vs Éco-solvant tech compare → finitions rail + CTA → configurator steps bar.
- Navbar **Matières & Finitions** opens `/matieres-finitions` with the same visual system as `/solutions` (photo hero, trust strip, image cards, finitions rail + CTA, configurator bar). Content: 6 matières + 8 finitions.
- Page sections follow: Nos solutions → Nos finitions → Quel sticker / configurateur → Une technologie professionnelle → prefooter + footer.
- Nos solutions uses 7 product cards: 4 on the first row, then 3 centered on the second row. Card design: rounded white cards, optional black/yellow badge, product image, yellow stars, and a yellow 3D “Shop now” button with hard offset shadow.
- Nos finitions: gold vertical accent beside the heading, horizontal row of white finish cards (circular swatch + label), and a taller dark CTA card on the right that slightly overlaps the rail.
- Quel sticker: two white cards on light gray — left picker card (title + 7 need tiles in one row), right configurator card (image + copy + gold CTA).
- Une technologie professionnelle: slim 50/50 banner — left printer photo with dark Roland | Mimaki overlay, right copy with gold accent bar, body text, and 3 horizontal feature items with circular outline icons.
- Footer: palm-leaf prefooter with 3 columns + gold outline icons + ghost CTA; black bar with logo, pipe-separated nav, social icons; dark legal row with copyright + Mentions / CGV / Politique.
