# Architectural & Design Decision Records (DECISIONS.md)
## Mobile Spatial Photo Album (E-Album)

This log records every significant architectural, design, and interaction decision. Historical decisions are preserved for provenance.

---

### ADR-001: Zero-Cover, Immediate Photo 01 Focal Presentation
* **Date:** 2026-09-13
* **Decision:** Eliminate opening book cover, leather cloth textures, gold debossing, and 3D hinge-opening animations. Load the album immediately into Photo 01 in the focal plane ($Z=0$).
* **Context:** The initial prototype explored an archival book cover with gold foil stamping and an opening sequence. The user requested simplifying the product down to the pure essence of the photographs.
* **Rationale:** Adding steps before the viewer sees the photographs creates unwanted friction. In a digital medium, the immediate visual impact of the first photograph is significantly more powerful and modern.
* **Alternatives Considered:**
  1. Skeuomorphic 3D book cover with turn-page hinge (rejected: felt artificial and gimmicky).
  2. Minimalist typography splash cover with "Open" button (rejected: extra click requirement).
* **Consequences:** The album feels like a direct gallery immersion. Code complexity was reduced by eliminating complex cover mesh calculations.

---

### ADR-002: Transition from Uncontrolled Continuous Scroll to Clamped Indexed State Machine
* **Date:** 2026-09-13
* **Decision:** Replace free-flowing native continuous scroll runways with a locked, indexed state machine ($S \in \{0, 1, \dots, N-1\}$) featuring a hard single-photo clamp and 550ms transition latch.
* **Context:** A continuous scroll prototype with momentum scrolling was tested. While smooth, a single fast swipe with the thumb on mobile caused the camera to shoot past multiple photos, jumping directly from Photo 1 to Photo 6 or 7.
* **Rationale:** A fine-art photobook requires contemplative pacing. The user must never accidentally skip memories due to browser physics momentum. One swipe must equal exactly one photo transition.
* **Alternatives Considered:**
  1. CSS `scroll-snap-type: y mandatory` (rejected: browser implementation varies widely across iOS Safari/Chrome; momentum still skips multiple snap points).
  2. Free scroll with heavy friction damping (rejected: unpredictable landing points, leaving photos half-receded).
* **Consequences:** Touch events are intercepted and processed analytically. The engine guarantees reliable, 1-to-1 tactile progression.

---

### ADR-003: Removal of Top Inspector Switcher Bar
* **Date:** 2026-09-13
* **Decision:** Completely remove the fixed top header (`.inspector-header`) containing developer jump pills (`[1. Matting]`, `[2. Full Bleed]`, etc.) from both desktop and mobile views.
* **Context:** The inspector was added as an internal developer scrubber during rapid prototyping. When opened on mobile, it created unwanted visual clutter, blocked the top safe area, and looked like a software dashboard.
* **Rationale:** The visual north star requires near-zero UI chrome. The user experience should feel like an intimate art exhibition, not a developer test harness.
* **Alternatives Considered:**
  1. Hide header behind a floating debug button (rejected: unnecessary clutter).
  2. Show only on desktop, hide on mobile via media query (rejected: desktop should reflect true mobile-first purity).
* **Consequences:** Viewport is 100% clean and distraction-free.

---

### ADR-004: Apple Liquid Glass for Progress Pill Only
* **Date:** 2026-09-13
* **Decision:** Restrict the custom Apple Liquid Glass material token exclusively to the bottom floating progress pill (`01 / 07`). Photos remain opaque, physical prints.
* **Context:** Reviewing AI-generated design trends revealed a heavy tendency to wrap every photograph, card, and caption in frosted glassmorphism.
* **Rationale:** Photos placed on frosted glass suffer from muddy contrast and look like software notifications. Keeping photos on solid archival matting or raw edge-to-edge full-bleed preserves photography integrity.
* **Alternatives Considered:**
  1. Glass container cards behind each photo (rejected: AI slop anti-pattern).
  2. Plain flat CSS gray pill (rejected: lacked the refined optical luxury of Apple VisionOS/iOS glass).
* **Consequences:** The pill feels like a precise physical lens hovering above the album.

---

### ADR-005: Decoupled Album Data Model (`album-data.js`)
* **Date:** 2026-09-13
* **Decision:** Extract all photographic URLs, titles, aspect ratios, and captions into an independent `album-data.js` module.
* **Context:** Prototype code had hardcoded `<img>` tags directly embedded inside `index.html`.
* **Rationale:** In a production album, content creators or owners must be able to swap, reorder, or add photos without editing spatial animation math or HTML markup.
* **Alternatives Considered:**
  1. JSON file loaded via `fetch()` (rejected: introduces asynchronous network delays and local file CORS issues when opened directly).
  2. Hardcoded HTML markup (rejected: poor maintainability, error-prone edits).
* **Consequences:** Dynamic DOM instantiation driven cleanly by `album-data.js`.

---

### ADR-006: Permanent 3-Stage Narrative Integration (Landing -> Second Photo -> Spatial Album)
* **Date:** 2026-09-13
* **Decision:** Replace the single-screen album view in `index.html` with a cohesive 3-stage narrative journey:
  1. **Stage 1 (Cover / Landing Page):** Prominent featured photo with editable headline (`<h1 id="landingTitle">`), subtitle, and pulsating "Scroll down" pill.
  2. **Stage 2 (Second Page):** Second featured photo with italicized caption and prominent "Scroll down" text & indicator placed directly below the photo.
  3. **Stage 3 (Spatial Photo Album):** Full 24-photo spatial 3D book monograph with directional peeling, zero-overlap depth, double-tap zoom, and Apple glass progress pill.
* **Context:** The experimental prototype validated that a curated landing page and second prologue photo create an intimate emotional entry into the photo exhibition.
* **Rationale:** Blending these stages permanently into `index.html` eliminates experimental fragmentation, makes photo/text editing effortless via explicit HTML comments, and maintains flawless gesture continuity across all three stages.
* **Consequences:** `experiment.html` is safely retired. `index.html` is the authoritative production entry point. All 3D kinematics and swipe gestures operate continuously.

---

### ADR-007: Instant Return-to-Cover Control & Pill Action from Deep Album View (Option B)
* **Date:** 2026-09-14
* **Decision:** Provide an instant return mechanism straight back to the landing page (Stage 0) from any photo inside Stage 3, combining:
  1. An Apple Liquid Glass return button (`#returnCoverBtn`) in the top safe area (`<button class="apple-return-btn">`).
  2. Direct tap action on the bottom progress pill (`#glassPill`).
  3. Clean state resets: resetting photo zoom (`resetZoomImmediate()`), photo index (`currentState = 0`), progress, and smooth re-entry into Stage 0.
  4. Desktop keyboard shortcuts (`Escape` / `Home` to return to cover, arrow keys for navigation).
* **Context:** When browsing deep into the album (e.g. Photo 15 of 25), backward swiping sequentially stepped back one photo at a time (Photo 15 -> 14 -> ... -> 1) before reaching the landing page.
* **Rationale:** While fine-art photo-by-photo paging is ideal during forward browsing, users need a friction-free way to return directly to the cover without repetitively swiping through 15+ photos.
### ADR-008: Curatorial Pill Separation, Desktop Pointer Parity, & Asset Rigor
* **Date:** 2026-09-14
* **Decision:** 
  1. **Accidental Eject Separation:** Revert `#glassPill` to a pure curatorial indicator (`cursor: default`, no active scale, no click handler). Retain the dedicated `< Cover` button in the top safe area as the sole explicit return control to eliminate accidental ejections when viewers instinctively tap the pill to check progress.
  2. **Desktop Pointer / Mouse Drag Parity:** Register pointer event handlers on desktop (`pointerdown`, `pointermove`, `pointerup`) with 1:1 drag preview matching mobile touch kinematics.
  3. **Purge Fake Plastic Sheen:** Strip artificial `.glass-sheen` overlays and DOM nodes from photo containers to preserve authentic photograph presentation.
  4. **Asset & Viewport Stabilization:** Correct Photo 5 path to `./photos/5.png` in `album-data.js`, delete duplicate WhatsApp assets, adopt `dvh` units (`100dvh`, `76dvh`), and configure immutable 1-year caching in `vercel.json`.
* **Context:** Multi-agent QA audit identified 16 bugs across media pipelines, desktop interaction disparity, accidental ejection risks, and subtle layout shifts during mobile browser address bar retraction.
* **Rationale:** A world-class photobook must exhibit zero network errors, predictable tactile controls on both mobile and desktop, and uncompromising visual restraint.
* **Consequences:** Flawless zero-error execution, resilient gesture tracking across input types, and authentic Apple Liquid Glass aesthetics.

