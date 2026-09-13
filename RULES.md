# Non-Negotiable Project Rules (RULES.md)
## Mobile Spatial Photo Album (E-Album)

These rules are permanent and mandatory. Every line of code, CSS property, and visual asset added to this repository must comply with these 18 rules.

---

### Rule 1: Photography is the Primary Visual Content
The photographs are not decorative background graphics for a website; they are the sole reason the website exists. Every design choice must elevate the photographs.

### Rule 2: UI Must Not Compete With Photography
The interface chrome must remain almost invisible. If an interface element draws the eye away from the photography, reduce its contrast, shrink its footprint, or remove it entirely.

### Rule 3: No Generic SaaS UI
No bento grids, hero section tags, feature lists, pricing-style tables, pill badges everywhere, avatars, or software marketing components.

### Rule 4: No Unnecessary Sections
No cover pages, preface letters, chapter dividers, timeline milestones, quotes pages, or celebratory outro cards. The website begins immediately at Photo 01 and progresses directly through the photographs.

### Rule 5: No Birthday Clichés
The birthday is the occasion for the gift, not the design aesthetic. Absolutely no cake illustrations, candles, party horns, balloons, floating confetti, emoji hearts, or birthday letters.

### Rule 6: No Random 3D
Do not add floating spheres, 3D cubes, glowing particles, wavy mesh ribbons, or sci-fi environments. The photographs themselves are the 3D objects moving through physical depth.

### Rule 7: No Glass Everywhere
Do not wrap every photo, caption, or element in frosted glass. Glass is reserved exclusively for the persistent system chrome (the floating bottom progress pill). Photographs remain solid, physical, archival paper prints.

### Rule 8: Glass Must Behave Like Real Material
Glass must feature optical blur, saturation boost, a hairline light-catching rim, and environmental transmission. It must never look like a cheap flat CSS box with `opacity: 0.5`.

### Rule 9: Color Palette Must Remain Restrained
The interface palette is strictly monochromatic museum warm-white, ivory, and soft graphite. All vibrant color in the user experience must come exclusively from the photographs.

### Rule 10: Typography Must Remain Refined and Minimal
Use at most one classical serif and one neutral sans-serif. Keep text sparse, optically sized, and curatorial. Never add paragraphs of explanatory filler text.

### Rule 11: One Gesture Never Skips Multiple States (Hard Clamp)
No matter how hard, fast, or long the user flicks their thumb, a single gesture must advance or retreat by strictly ONE photo state. Multi-photo velocity skips are an explicit failure mode.

### Rule 12: Do Not Use Uncontrolled Browser Momentum Scrolling
Uncontrolled native scrolling creates erratic jumps and destroys the spatial photobook illusion. Navigation must be driven by an indexed state machine ($0, 1, 2, \dots$) with tactile drag previews and transition locks.

### Rule 13: No Feature Exists Merely Because It Is Technically Possible
Do not add sound effects, music players, gyro tilt, bloom filters, or complex settings panels just because the browser supports them. Restraint defines luxury.

### Rule 14: Performance Is Part of Design Quality
Sustained 60fps (120fps on ProMotion) on mobile is mandatory. Avoid layout thrashing, animate only GPU-promoted properties (`transform`, `opacity`), and cull inactive planes from rendering.

### Rule 15: Mobile Is the Primary Platform
Design, calibrate, and test directly for 360px–430px mobile portrait viewports (390px iPhone reference). Desktop is secondary and serves solely as a development convenience.

### Rule 16: Do Not Design Desktop-First
Never design a wide horizontal layout and shrink it with CSS down to mobile. Build mobile-first, ensuring touch targets, safe areas (`env(safe-area-inset)`), and portrait aspect ratios are native.

### Rule 17: Do Not Invent Content
Never fabricate poetic narratives, romantic stories, friendship timelines, or fake user copy. If metadata is absent, keep captions minimal or omit them.

### Rule 18: Do Not Silently Change Approved Design Direction
Never revert to previously rejected patterns (e.g., book binding hinges, chapter title screens, gold borders, or continuous web runway) without explicit discussion and ADR logging in `DECISIONS.md`.

---

## The Anti-Yesman Rule

> **"Do not agree with a design decision simply because the user suggested it."**

If a requested change or user suggestion compromises:
1. **Aesthetic Beauty & Restraint** (e.g., adding decorative glitter or celebratory banners),
2. **Mobile Usability & Tactile Feel** (e.g., erratic scrolling),
3. **Hardware Performance** (e.g., CPU-heavy backdrop filters across entire viewports),
4. **Conceptual Cohesion** (e.g., turning an intimate photobook into a multi-tab web application), or
5. **Codebase Maintainability**,

**You are required to challenge the request.** Explain specifically why the proposal degrades the product and present a cleaner, more disciplined alternative.
