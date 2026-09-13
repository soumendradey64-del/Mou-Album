# System Architecture & Technical Specification (ARCHITECTURE.md)
## Mobile Spatial Photo Album (E-Album)

**Document Version:** 1.0.0  
**Stack Paradigm:** Pure Vanilla Web Standards (ES6+ / Modern CSS3 / HTML5)  
**Execution Runtime:** Direct Browser Engine (Zero heavy bundler overhead, instant boot)  
**Repository Root:** `c:\Users\soume\Desktop\Album`

---

## 1. Architectural Philosophy & Dependency Strategy

### Zero-Framework / Zero-Build Dependency Decision
* **Rationale:** A mobile spatial photobook requires maximum frame budget ($16.6\text{ms}$ per frame on 60Hz, $8.3\text{ms}$ on 120Hz ProMotion). Adding heavy SPA frameworks (React, Next.js, Vue) introduces unnecessary hydration delays, bundle parsing overhead, and virtual DOM diffing penalties that induce scroll micro-stutter on mobile webviews.
* **Architecture:** Modular ES6+ components utilizing native browser capabilities:
  * Hardware-accelerated CSS 3D Transforms (`translate3d`, `scale`, `rotateX`, `perspective`).
  * High-fidelity Touch and Pointer Events API with analytical velocity calculation.
  * Direct `requestAnimationFrame` render loop with analytical Apple Bezier solver.
  * Zero runtime dependencies. Runs directly in any modern mobile browser.

---

## 2. Project Directory Structure

```
c:\Users\soume\Desktop\Album/
├── PRD.md                     # Locked product requirements & user journey
├── AGENTS.md                  # Multi-agent operating rules & directives
├── DESIGN.md                  # Visual design, typography, & glass specifications
├── ARCHITECTURE.md            # Technical architecture & subsystem design (this file)
├── RULES.md                   # Non-negotiable engineering & design constraints
├── MEMORY.md                  # Persistent long-term project facts & memory
├── DECISIONS.md               # Architectural decision record (ADR)
├── TESTING.md                 # QA test matrices & gesture verification protocols
├── IMPLEMENTATION-PLAN.md     # Phased execution roadmap
├── README.md                  # Developer quickstart & repo overview
│
├── index.html                 # Production entrypoint & viewport shell
├── preview.html               # Desktop & staging preview harness
├── spatial-engine.js          # Core gesture state machine & 3D interpolation engine
├── album-data.js              # Decoupled album photographic data model
└── assets/
    └── qr-code.png            # Static QR code for mobile device access
```

---

## 3. Subsystem Architecture

The architecture comprises four decoupled subsystems:

```
┌─────────────────────────────────────────────────────────────┐
│                    ALBUM DATA MODEL                         │
│                    (album-data.js)                          │
└──────────────────────────────┬──────────────────────────────┘
                               │ supplies photos & layouts
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 GESTURE & TOUCH SUBSYSTEM                   │
│         (Pointer / Touch Normalizer & Velocity)             │
└──────────────────────────────┬──────────────────────────────┘
                               │ emits continuous drag & commits
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              INDEXED ALBUM STATE MACHINE                    │
│   (Discrete States 0..N-1, Clamped 1-Photo Latch, Easing)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ drives state & displayState
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              3D SPATIAL & MATERIAL RENDERER                 │
│      (GPU 3D Planes, Parallax, Apple Glass Pill Pill)       │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Subsystem Details

### 4.1 Album Data Model (`album-data.js`)
Content is strictly decoupled from presentation:
```javascript
export const albumData = {
  title: "Archival Spatial Journey",
  totalPhotos: 7,
  photos: [
    {
      id: 1,
      type: "matting", // 'matting' | 'fullbleed' | 'fineart' | 'dual' | 'panoramic' | 'square' | 'intimate'
      url: "https://images.unsplash.com/photo-...",
      title: "Morning bamboo path",
      meta: "01 / 07",
      alt: "Quiet bamboo path in morning light"
    },
    // ... remaining photo definitions
  ]
};
```

### 4.2 Gesture Normalizer & Touch Model
* **Events Captured:** `touchstart`, `touchmove`, `touchend`, `touchcancel` (plus `pointerdown`, `pointermove`, `pointerup` for desktop trackpad/mouse testing).
* **1:1 Tactile Drag Preview:** As the finger drags vertically by $\Delta Y$, the continuous display progress shifts proportionally:
  $$\Delta \text{Progress} = -\frac{\Delta Y}{\text{SwipeRangePx}} \quad (\text{where SwipeRangePx} = 260\text{px})$$
* **Boundary Rubberbanding:** When dragging past Photo 0 or Photo $N-1$, an iOS-style resistance function prevents jarring stops:
  $$\text{Offset}_{\text{damped}} = \frac{\Delta Y}{1.0 + |\Delta Y| \times 1.6} \times 0.28$$
* **Velocity Normalization:** A rolling 100ms FIFO buffer tracks touch coordinates and timestamps. On release:
  $$\text{Velocity} = \frac{Y_{\text{start}} - Y_{\text{end}}}{t_{\text{end}} - t_{\text{start}}} \quad (\text{px/ms})$$
* **Commit Threshold:** The transition to the next state triggers if:
  $$\text{DragFraction} \ge 0.22 \quad \text{OR} \quad \text{Velocity} \ge 0.40\text{px/ms}$$

### 4.3 Indexed State Machine & Transition Latch
* **State Space:** Discrete integer $S \in [0, N-1]$.
* **Hard Clamp Rule:** Under NO circumstances can a single gesture advance $> 1$ state:
  $$S_{\text{next}} = \text{clamp}(S_{\text{current}} + \Delta S, 0, N-1) \quad \text{where } \Delta S \in \{-1, 0, 1\}$$
* **Transition Latch:**
  * When a transition commits, `isTransitioning = true`.
  * All further drag, wheel, or keyboard triggers are ignored until the 550ms Apple ease completes.
  * Debounced trackpad wheel listener prevents continuous trackpad momentum from queuing multiple slides.

### 4.4 3D Spatial Rendering Pipeline
* **Coordinate Space:**
  * Viewport: `perspective: 1200px; perspective-origin: 50% 50%; transform-style: preserve-3d;`
  * Active Plane $S$: Centered at $(X: 0, Y: 0, Z: 0)$, `scale(1.0)`, `opacity: 1.0`.
  * Receding Plane ($S - \text{diff}$): Moves to $Z = -\text{diff} \times 380\text{px}$, `scale(1.0 - diff * 0.14)`, `rotateX(-diff * 4.5deg)`, opacity fades to 0.
  * Approaching Plane ($S + \text{diff}$): Glides from $Z = +\text{diff} \times 280\text{px}$ into 0.
* **Culling Optimization:** Any plane where $|i - \text{displayState}| > 1.25$ is set to `display: none` to conserve mobile GPU fill rate and texture memory.

### 4.5 Apple Liquid Glass Material Engine
* Positioned as a floating HUD element (`z-index: 50`) anchored to bottom safe areas.
* Uses dual-layer specular highlights:
  * Top white highlight (`inset 0 0.5px 0.5px rgba(255, 255, 255, 0.95)`)
  * Bottom diffuse shadow
* Dynamically syncs with continuous progress:
  * Fill bar width indicates total journey completion.
  * Counter text updates seamlessly.
  * Opacity attenuates automatically during full-bleed scenes.

---

## 5. Mobile Performance Strategy

1. **Composite-Only Properties:** Only `transform` and `opacity` are modified per frame. Zero `top`, `left`, `margin`, or `padding` mutations.
2. **`will-change: transform, opacity`:** Pre-promotes spatial planes to independent GPU compositing layers.
3. **Progressive Lookahead Asset Loading:**
   * High-priority initial render for Photo 01 and Photo 02 (`fetchpriority="high"`).
   * Lazy loading for subsequent photos as $S$ increments.
4. **Passive Listeners:** All touch and wheel listeners use `{ passive: true }` except where `e.preventDefault()` is mandatory to lock native page bouncing.
