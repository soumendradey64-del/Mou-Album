# Quality Assurance & Testing Protocols (TESTING.md)
## Mobile Spatial Photo Album (E-Album)

This document establishes the mandatory test suites, verification matrices, and quality gates for the mobile spatial photo album.

---

## 1. Mobile Viewport Testing Matrix

All visual elements, spatial transforms, safe-area offsets, and touch interactions must be verified across the standard mobile viewport spectrum:

| Viewport Width | Typical Hardware Device | Primary Verification Target |
|---|---|---|
| **360px** | Small Android (Samsung Galaxy A-series) | Margin breathing room, caption text wrapping |
| **375px** | iPhone SE / iPhone 8 | Compact height scaling, glass pill anchor |
| **390px** | **iPhone 12 / 13 / 14 / 15 (Primary Reference)** | Optical balance, 24px gallery margins, safe area |
| **393px** | iPhone 14 Pro / 15 Pro / 16 (Dynamic Island) | Top status bar clearance, 120Hz ProMotion smoothness |
| **412px** | Google Pixel 7 / 8, Samsung Galaxy S23/S24 | Fluid aspect ratio scaling, touch drag resistance |
| **430px** | iPhone 14 Plus / 15 Pro Max / 16 Pro Max | Maximum portrait display size, image sharpness |

---

## 2. Gesture & Interaction Test Suite

The interaction engine must pass all seven tactile gesture tests without exception:

| Test ID | Gesture Description | Expected Behavior | Pass Criteria |
|---|---|---|---|
| **G-01** | **Tiny Gesture** (Drag $< 20\text{px}$) | Photo previews slight movement with 1:1 tactile drag, then smoothly snaps back to focal plane upon release. | Does not advance state; returns to $Z=0$ without jitter. |
| **G-02** | **Slow Deliberate Drag** (Drag $> 60\text{px}$) | Drag reaches the commit threshold ($\ge 22\%$ of swipe range); releases into next photo via Apple ease. | Smooth transition to $S+1$; no snapping back. |
| **G-03** | **Normal Swipe** ($\approx 100\text{px}$, moderate speed) | Cleanly transitions to the adjacent photo ($S \to S+1$ or $S \to S-1$). | Completes transition in $\sim 500\text{ms}$; pill updates. |
| **G-04** | **Strong / Aggressive Flick** (High velocity, full thumb sweep) | Transitions to the immediately adjacent photo ($S+1$). **MUST NEVER SKIP MULTIPLE PHOTOS.** | Advances by **EXACTLY 1** state. State $0 \to 4$ is strictly prevented. |
| **G-05** | **Rapid Repeated Swipes** (3 to 4 fast flicks in under 1 second) | The transition latch locks subsequent triggers during the 550ms animation; subsequent swipes do not queue erratic jumps. | Advances only 1 photo per completed animation latch cycle. |
| **G-06** | **Boundary Pull: First Photo** (Pull down at Photo 01) | Tactile rubberband resistance prevents leaving the top boundary. | Stretches with logarithmic damping and snaps back cleanly. |
| **G-07** | **Boundary Push: Final Photo** (Push up at Photo 07) | Tactile rubberband resistance prevents over-advancing past the album end. | Stretches with damping and snaps back cleanly to Photo 07. |

---

## 3. Visual QA & Material Inspection

* **[ ] Typography Craft:** Newsreader curatorial italics render with crisp optical curves; zero ugly line wraps on 360px widths.
* **[ ] Apple Liquid Glass Realism:**
  * Background blur (`blur(24px)`) is smooth and artifact-free.
  * Colors behind the glass show enriched optical saturation (`saturate(180%)`).
  * Hairline 0.5px border catches light naturally.
  * Specular top highlight is subtle, not an artificial white strip.
* **[ ] Vanishing UI Behavior:**
  * On Photo 02 (Full-Bleed), the bottom glass pill fades down to 20% opacity.
  * On returning to framed photos, the pill returns smoothly to 100% opacity.
* **[ ] 3D Plane Depth Consistency:**
  * Receding photos scale down and translate back in $Z$ without clipping or popping.
  * Approaching photos emerge gracefully from depth.
  * Dual-plane composition (Photo 04) demonstrates noticeable optical parallax between front and back prints.

---

## 4. Browser Compatibility & Environmental Testing

* **iOS Mobile Safari (WebKit):**
  * Dynamic address bar transitions do not cause content jumping (`100dvh` verified).
  * Momentum bounce (`-webkit-overflow-scrolling`) does not fight custom gesture tracking.
  * Hardware acceleration active on all planes (`transform: translate3d`).
* **Android Google Chrome (Blink):**
  * Touch event coordinates normalize properly without passive listener warnings.
  * Font rendering matches system anti-aliasing.
* **Desktop Review (macOS / Windows):**
  * Keyboard arrows (ArrowDown / ArrowUp / PageDown / PageUp) advance and retreat by exactly 1 state.
  * Mouse pointer drag functions identically to touch drag for desktop previewing.

---

## 5. Performance Benchmarks

* **FPS Target:** Sustained 60fps on standard mobile chips (A13 Bionic / Snapdragon 8 Gen 1); 120fps on ProMotion.
* **Paint & Layout Cost:**
  * Zero forced synchronous layouts (`reflow`) during drag and animation ticks.
  * Culling verification: Inactive planes outside the active visual window are set to `display: none`.
* **Memory Footprint:** GPU memory stays below 60MB on mobile browsers.

---

## 6. Accessibility & Reduced Motion

* **`prefers-reduced-motion: reduce`:**
  * When enabled in OS settings, 3D translation ($Z$-depth) and pitch tilt are disabled.
  * Spatial motion is replaced with a gentle, dignified cross-fade ($200\text{ms}$).
* **Screen Reader Accessibility:**
  * Each photographic plane provides a descriptive `alt` attribute and semantic `<figcaption>`.
  * The progress pill conveys current slide state via ARIA live updates (`aria-live="polite"`).
