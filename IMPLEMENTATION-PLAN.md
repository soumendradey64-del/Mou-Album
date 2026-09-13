# Phased Implementation Plan (IMPLEMENTATION-PLAN.md)
## Mobile Spatial Photo Album (E-Album) — Production UI Build

This document outlines the systematic, phased implementation strategy for delivering the production UI/UX of the mobile spatial photo album.

---

## Roadmap Overview

```
PHASE 0: Repository Inspection & Persistent Documentation  [COMPLETED]
   ↓
PHASE 1: Design Tokens & Visual Foundations Architecture   [READY]
   ↓
PHASE 2: Decoupled Album Data Model (album-data.js)         [READY]
   ↓
PHASE 3: Mobile Shell & Viewport Inset Harness (100dvh)    [READY]
   ↓
PHASE 4: Progressive Photo Loading & Asset Strategy        [READY]
   ↓
PHASE 5: Indexed Album State Machine (Discrete 0..N-1)     [READY]
   ↓
PHASE 6: Touch & Gesture Normalization Subsystem           [READY]
   ↓
PHASE 7: Photo Transition Choreography & Apple Easing      [READY]
   ↓
PHASE 8: 3D Spatial Plane & Stereoscopic Parallax System   [READY]
   ↓
PHASE 9: Apple Liquid Glass Material System & Vanishing UI [READY]
   ↓
PHASE 10: Curatorial Typography & Aesthetic Polish         [READY]
   ↓
PHASE 11: GPU Compositor & Performance Optimization        [READY]
   ↓
PHASE 12: Accessibility & Reduced-Motion Mode              [READY]
   ↓
PHASE 13: Mobile Viewport QA (360px – 430px)               [READY]
   ↓
PHASE 14: Visual QA & Anti-Slop Audit                      [READY]
   ↓
PHASE 15: Production UI Readiness & Sign-Off               [READY]
```

---

## Phase Details

### Phase 0: Repository Inspection & Persistent Memory [COMPLETED]
* Inspect existing workspace, git state, prototype code, and installed skills.
* Establish authoritative root markdown documents (`PRD.md`, `AGENTS.md`, `DESIGN.md`, `ARCHITECTURE.md`, `RULES.md`, `MEMORY.md`, `DECISIONS.md`, `TESTING.md`, `IMPLEMENTATION-PLAN.md`, `README.md`).
* Confirm zero contradictions across all specifications.

### Phase 1: Design Tokens & Visual Foundations Architecture
* Define unified CSS variables in `style.css` / `:root`:
  * Alabaster canvas (`#FAF9F6`), pure white matting (`#FFFFFF`), carbon graphite (`#1C1B19`).
  * Elevation shadow system and glass refraction tokens.
  * Typography stacks: curatorial Newsreader serif and system sans.

### Phase 2: Decoupled Album Data Model
* Create `album-data.js` containing the 7 curated fine-art photographs with:
  * Unique ID, composition type, high-res URL, editorial caption, and accessibility alt text.
  * Clean programmatic API to dynamically generate spatial planes without hardcoded HTML.

### Phase 3: Mobile Shell & Viewport Inset Harness
* Configure production `index.html` structure:
  * Enforce `viewport-fit=cover` and dynamic viewport height (`100dvh`).
  * Safe-area padding for iOS status bar and bottom swipe bar.
  * Strict mobile container sizing (`390px` reference frame on desktop; fluid `100vw` on mobile).

### Phase 4: Progressive Photo Loading & Asset Strategy
* High-priority loading for initial focal photos (`fetchpriority="high"` on Photo 01 and 02).
* Background preloading of adjacent assets ($K+2$ lookahead).
* Smooth image load transitions (subtle opacity reveal once image decoded).

### Phase 5: Indexed Album State Machine
* Integrate the discrete state machine from `spatial-engine.js`:
  * States strictly bounded: $S \in \{0, 1, 2, 3, 4, 5, 6\}$.
  * State transition clamp: advances $\pm 1$ per committed gesture.
  * 550ms transition latch to prevent rapid trigger queueing.

### Phase 6: Touch & Gesture Normalization Subsystem
* Implement 1:1 tactile drag preview:
  * Finger drag translates physical planes proportional to drag distance.
  * Rolling 100ms velocity buffer.
  * iOS rubberband boundary resistance on Photo 01 pull-down and Photo 07 push-up.
  * Debounced trackpad/wheel accumulation to eliminate multi-slide flick skips.

### Phase 7: Photo Transition Choreography & Apple Easing
* Implement analytical Apple Cubic Bezier solver (`cubic-bezier(0.16, 1.0, 0.3, 1.0)`).
* Coordinate synchronized movement:
  * Current photo recedes in $Z$ ($0 \to -380\text{px}$), scales down, fades out.
  * Target photo glides from depth ($+280\text{px} \to 0$), scales down into focus, fades in.

### Phase 8: 3D Spatial Plane & Stereoscopic Parallax System
* Render the 7 distinct photographic compositions (Matting, Full-Bleed, Fine-Art, Dual Overlap, Panoramic Horizon, Archival Square, Intimate Portrait).
* Real-time stereoscopic parallax calculation for dual prints (Photo 04).
* GPU plane culling (`display: none` when $|i - S| > 1.25$).

### Phase 9: Apple Liquid Glass Material System & Vanishing UI
* Build the floating bottom HUD pill:
  * Real-time progress bar fill.
  * Optical saturation boost (`saturate(180%)`), deep blur (`blur(24px)`), hairline specular rim.
  * Contextual vanishing logic: auto-dims to 20% opacity when Full-Bleed photo is active.

### Phase 10: Curatorial Typography & Aesthetic Polish
* Fine-tune serif italic captions, letter spacing, line height, and archival meta stamps.
* Remove any lingering visual noise or harsh contrast.

### Phase 11: GPU Compositor & Performance Optimization
* Verify zero forced reflows during gesture loop.
* Confirm sustained 60fps / 120fps on mobile Safari and Chrome.
* Memory audit ensuring GPU texture disposal.

### Phase 12: Accessibility & Reduced-Motion Mode
* Implement `@media (prefers-reduced-motion: reduce)`: replace 3D translations with dignified 200ms cross-fades.
* Add ARIA live attributes to the progress pill and descriptive `alt` tags to all prints.

### Phase 13: Mobile Viewport QA (360px – 430px)
* Test and certify across 360px, 375px, 390px, 393px, 412px, 430px viewports.
* Verify safe-area clearance and touch response.

### Phase 14: Visual QA & Anti-Slop Audit
* Run the strict 21-point Visual Quality Gate from `PRD.md`.
* Ensure zero AI clichés, zero birthday tropes, zero generic cards.

### Phase 15: Production UI Readiness & Sign-Off
* Final check of persistent documentation.
* Provide clean live mobile preview instructions.
