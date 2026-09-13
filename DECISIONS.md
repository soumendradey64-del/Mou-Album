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

