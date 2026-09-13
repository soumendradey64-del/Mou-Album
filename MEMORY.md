# Project Memory & Persistent Knowledge (MEMORY.md)
## Mobile Spatial Photo Album (E-Album)

**Purpose:** Long-term repository memory of verified facts, locked design principles, rejected approaches, and recurring engineering constraints.

---

## 1. Locked Product Definition

* **Product Type:** Mobile-first spatial digital photobook with 3-stage progression.
* **Core Interaction Loop:**
  $$\text{Stage 1: Hero Cover} \xrightarrow{\text{Scroll Down}} \text{Stage 2: Prologue} \xrightarrow{\text{Scroll Down}} \text{Stage 3: Spatial Album (24 Photos)} \longleftrightarrow \text{Photo } i$$
* **Content:** The user-supplied photographs are the entire content. No extraneous sections.

---

## 2. Locked Design Decisions

1. **Monochrome Museum Palette:** Background is warm-white/ivory or deep archival dark, text is crisp white / graphite. Color exists exclusively inside photographs.
2. **Apple Liquid Glass HUD:** Only the floating bottom progress pill uses frosted glass (`backdrop-filter: blur(24px) saturate(180%)`, hairline rim).
3. **Double-Tap Focal Zoom:** Tapping on a photo zooms into the exact touched coordinates while keeping swipe-protection so fast scrolls don't trigger accidental zoom.
4. **Directional 3D Peeling:** Forward gestures peel left (`transform-origin: left center`), backward gestures peel right (`transform-origin: right center`). Zero page overlap.
5. **Decoupled Ambient Blur:** Background blur (`54px`) renders on independent underlying DOM layers for smooth 60fps mobile compositor performance.

---

## 3. Architecture Provenance

* **Stage 1 (Cover):** Big hero photo with editable headline (`#landingTitle`) and subtitle.
* **Stage 2 (Prologue):** Second featured photo with caption and `"scroll down"` text indicator beneath the frame.
* **Stage 3 (Album):** Continuous 24-photo spatial monograph. Swiping back from Photo 1 returns to Stage 2, and then to Stage 1.

---

## 4. Recurring Engineering Constraints & Pitfalls

* **Mobile Address Bar (Dynamic Viewport):**
  * Avoid `100vh` on mobile because iOS Safari and Android Chrome collapse/expand URL bars, causing jitter.
  * Use `100dvh` with a fallback to `window.innerHeight`.
* **iOS Rubberbanding & Gesture Stealing:**
  * Native page scrolling can conflict with custom touch tracking. The viewport container must use `overflow: hidden; touch-action: none;` on the stage so touch events are cleanly captured by the engine.
* **Safe Area Collisions:**
  * Always add `env(safe-area-inset-bottom)` to the floating pill offset (`bottom: calc(24px + env(safe-area-inset-bottom, 0px))`).
* **GPU Memory Leakage:**
  * High-resolution images on 3D planes consume massive GPU texture memory.
  * Planes beyond $|i - S| > 1.25$ must be set to `display: none` to unbind textures from the compositor.
* **Multi-Touch & Pinch Conflicts:**
  * Multi-touch gestures must be clamped or ignored to avoid zooming or erratic $\Delta Y$ jumps. Track only the primary touch (`e.touches[0]`).

---

## 5. Local Runtime & Development Facts

* **Primary Port:** `3000` (e.g., `python -m http.server 3000 --bind 0.0.0.0`).
* **Local Network IP:** `192.168.29.233` (accessible via mobile phone on local Wi-Fi).
* **Dependencies:** Zero external npm packages required for UI execution; pure vanilla web standards.
