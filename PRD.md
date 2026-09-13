# Product Requirements Document (PRD)
## Project: Mobile Spatial Photo Album (E-Album)

**Document Version:** 1.0.0  
**Status:** In Active Production UI Build  
**Primary Target:** Mobile Browsers (iOS Safari, Android Chrome / 390px reference)  
**Repository Root:** `c:\Users\soume\Desktop\Album`

---

## 1. Product Definition & Vision

The Mobile Spatial Photo Album is a minimal, Apple-restrained digital photobook designed to be opened instantly on a mobile browser (typically via a scanned QR code).

The product definition is locked and intentionally simple:
```
USER SUPPLIES PHOTOS
         ↓
  STAGE 1: LANDING
(Big Hero Photo + Title)
         ↓
    SCROLL DOWN
         ↓
  STAGE 2: PROLOGUE
(Second Photo + "Scroll Down")
         ↓
    SCROLL DOWN
         ↓
  STAGE 3: SPATIAL MONOGRAPH
(24 Spatial 3D Book Pages)
         ↓
  PHOTO 1 ──► PHOTO 2 ──► ... ──► PHOTO 24
```

### Context vs. Product
* **Occasion Context:** A curated personal gift is the reason the album exists.
* **Product Reality:** It is **NOT** a generic greeting website. There are no cheesy stickers, confetti, or party fanfare.
* **Core Truth:** The photographs **ARE** the content. The UI exists only to frame the photography and provide tactile, spatial feedback.

---

## 2. User Journey

1. **Scan / Open:** User scans a physical QR code or opens a URL on mobile.
2. **Stage 1 — Cover / Landing Page:** The album opens onto a large curated hero photograph with an editorial title and a gentle "Scroll down" pulse indicator.
3. **Stage 2 — Prologue / Second Photo:** Scrolling down transitions to a second featured photograph with an intimate caption and a prominent `"scroll down"` prompt beneath the frame.
4. **Stage 3 — Spatial Photo Album:**
   * Scrolling down from Stage 2 smoothly transitions into the full 24-photo spatial 3D monograph.
   * Directional page peeling: swiping forward peels left, swiping backward peels right.
   * Dynamic focal zoom: double-tapping or pinching allows high-resolution detail inspection centered on the user's touch.
   * Floating Apple Liquid Glass pill indicates exact page progress (`01 / 24`).
5. **Quiet Completion:** Upon reaching the final photograph, boundary resistance indicates the end of the collection. Swiping back from Photo 1 returns to Stage 2, then Stage 1.

---

## 3. Functional Requirements

### FR-1: Indexed Album State Machine
* Album navigation must be strictly indexed: $S \in \{0, 1, 2, \dots, N-1\}$.
* **Hard Gesture Clamp:** Exactly ONE deliberate gesture advances or retreats exactly ONE state.
* **Multi-Skip Prevention:** A strong swipe, rapid flick, or high-velocity gesture must NEVER skip multiple photographs (e.g., state 0 to state 4 is strictly prevented).
* **Transition Latch:** Once an indexed transition is committed ($\sim 500\text{ms}$–$550\text{ms}$ duration), incoming touch, wheel, or keyboard triggers are locked until the active transition finishes.

### FR-2: 3D Spatial Photography
* Photographs are rendered as 3D planes inside a perspective viewport (`perspective: 1200px`).
* Only GPU-accelerated properties (`transform: translate3d(), scale(), rotateX()`, and `opacity`) may be animated during transitions.
* **Receding Plane ($K$):** Moves backward in $Z$ ($0 \to -350\text{px}$ to $-400\text{px}$), scales down ($1.0 \to 0.86$), slightly tilts on $X$-axis ($\approx -4^\circ$), and fades out.
* **Approaching Plane ($K+1$):** Begins deep in $Z$ ($+250\text{px}$ to $+280\text{px}$), scales down into focal scale ($1.0$), until centered at $Z=0$.
* **Dual-Plane Stereoscopic Parallax:** For compositions featuring multiple prints, independent $Z$-planes produce natural optical parallax during movement.

### FR-3: Apple Liquid Glass Material
* Used exclusively for system chrome: the floating bottom progress pill.
* Material specs:
  * Translucent white substrate: `rgba(255, 255, 255, 0.78)`
  * Deep blur and saturation boost: `backdrop-filter: blur(24px) saturate(180%)`
  * 0.5px hairline rim: `1px solid rgba(255, 255, 255, 0.65)`
  * Inner top specular reflection and soft diffused ground shadow.
* **Vanishing Behavior:** When a full-bleed, edge-to-edge photograph is in focus, the glass pill automatically dims to $\approx 20\%$ opacity to avoid competing with the image.
* **Photographs are never glass cards.** Images remain solid, physical, archival prints.

### FR-4: Content Separation & Data Model
* Photographic assets and metadata must be defined in a dedicated, decoupled data module (`album-data.js`).
* Adding, removing, or reordering photos requires editing only the data model, without touching layout or animation engine code.

---

## 4. Mobile Specifications

* **Target Viewport Widths:** 360px, 375px, 390px (primary reference), 393px, 412px, 430px.
* **Orientation:** Portrait locked / portrait primary.
* **Height Handling:** Must use modern `100dvh` (dynamic viewport height) to avoid layout shifts when mobile browser address bars collapse or expand.
* **Safe Area Insets:** Floating UI elements must respect `env(safe-area-inset-bottom)` and `env(safe-area-inset-top)` on notch/island devices.
* **Touch Targets:** Any interactive controls must meet WCAG minimum tap target sizing ($44\times 44\text{px}$).

---

## 5. Non-Goals (Strict Scope Exclusions)

The following systems are strictly excluded from this phase:
1. **No Backend:** No Node/Express/Python/Go API servers.
2. **No Database:** No SQL, NoSQL, Firestore, or SQLite.
3. **No Authentication / Accounts:** No user registration, login, JWTs, or session cookies.
4. **No CMS / Admin Dashboard:** No web-based photo uploader, cropping tool, or admin settings.
5. **No QR Code Generation Service:** QR codes are generated statically offline.
6. **No Analytics or Tracking:** No Google Analytics, Mixpanel, or telemetry scripts.
7. **No Social Features:** No comments, likes, reactions, sharing buttons, or follower counts.
8. **No Deployment Pipelines:** No Docker, Kubernetes, CI/CD actions, or custom cloud configuration.
9. **No Birthday Clichés:** No digital cakes, birthday songs, audio players, balloons, confetti, or party horns.

---

## 6. Performance & Quality Benchmarks

* **Frame Rate:** Sustained 60fps (120fps on ProMotion displays) during gesture dragging and tween animations.
* **Zero Layout Thrashing:** No reading layout properties (`offsetHeight`, `scrollTop`, `getBoundingClientRect`) inside the animation tick.
* **Asset Loading Strategy:**
  * Photo 01 and Photo 02 preloaded immediately on boot.
  * Subsequent photos lazy-loaded dynamically as the user progresses ($K+2$ lookahead).
* **Memory Management:** Inactive spatial planes beyond $|K - \text{active}| > 1.2$ are culled from rendering (`display: none`) to keep GPU texture memory minimal.

---

## 7. Accessibility Requirements

* Semantic document structure (`<main>`, `<figure>`, `<figcaption>`).
* Informative `alt` text for all photographic prints.
* Support for `prefers-reduced-motion`: When active, 3D perspective translations are disabled; transitions fallback to quiet, restrained cross-fades ($200\text{ms}$).
* Keyboard accessibility for desktop audits: ArrowDown / ArrowUp, PageDown / PageUp, Home / End.

---

## 8. Current Project Status

* **Status:** Phase 0 Completed (Project memory established; prototype validated; transitioning to production UI build).
* **Codebase State:**
  * Clean, zero-UI presentation running on `http://localhost:3000`.
  * Core spatial gesture engine validated.
  * Zero build errors, zero console warnings.
