# StickerBros React Clone — Design QA

## Evidence

- Source visual truth: full-page capture of `https://www.stickerbros.com/` at a 1363 × 936 CSS-pixel desktop viewport (1353 × 5788 captured pixels, device scale factor 1).
- Implementation evidence: full-page browser capture at a 1363 × 936 CSS-pixel desktop viewport (device scale factor 1).
- Responsive evidence: browser-rendered inspection at a 390 × 844 CSS-pixel mobile viewport (device scale factor 1).
- Primary state: homepage at the top of the page.
- Additional states checked: More dropdown open, empty-cart drawer open, mobile navigation open, product/review controls, and newsletter submission.

## Comparison history

### Iteration 1

The first full-view comparison found three visible differences: the customer-logo band used a combined sprite that left an unintended blank area, the word “LAST” lacked enough contrast against the hero artwork, and the “Follow the Bros” heading inherited the footer's white text color on a light background.

Changes made:

- Replaced the combined customer-logo strip with individually sized local logo assets.
- Split the hero heading into deliberate lines and added the dark outline/shadow treatment used by the reference.
- Corrected the social section's foreground color and tightened the surrounding spacing.
- Kept the desktop navigation sticky to match the source behavior.

### Iteration 2

The second full-view comparison confirmed the structure, hierarchy, section rhythm, imagery, color blocks, border treatments, typography, and footer composition were aligned closely enough for the requested responsive clone. No P0, P1, or P2 discrepancies remained.

## Focused checks

- **Hero:** headline hierarchy, sticker collage, bright yellow background, calls to action, and torn-paper transition checked.
- **Brand strip:** six customer marks checked for sizing, spacing, and contrast.
- **Product cards:** card borders, image framing, price treatment, badges, and responsive carousel behavior checked.
- **DTF promotion and benefits:** contrasting color blocks, imagery, copy width, and icon layout checked.
- **Reviews and social section:** card proportions, avatars, rating treatment, and section color checked.
- **Header, drawers, and footer:** desktop dropdown, empty-cart panel, mobile menu, newsletter form, navigation groups, and legal row checked.

## Runtime checks

- Desktop and mobile layouts were exercised in a real browser.
- Primary interactive controls were clicked and their open/closed states verified.
- No application console errors were observed. Browser-extension metadata errors were excluded because they are not emitted by the app.
- Production build and Sites worker tests are part of the final verification.

## Residual differences

- The reference site's physics-driven sticker motion is represented with lightweight CSS animation.
- Minor antialiasing and line-wrap differences can occur across browsers and operating systems.

final result: passed
