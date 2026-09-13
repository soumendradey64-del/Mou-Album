# Visual Design Specification (DESIGN.md)
## Single Source of Truth for Visual Design & Material System

**Project:** Mobile Spatial Photo Album (E-Album)  
**Design Authority:** Taste-Driven, Apple-Restrained, Fine-Art Curatorial Standards  
**Target Device Reference:** Mobile 390px × 844px (iPhone reference)

---

## 1. Design North Star

> **"The UI must remain quieter than the photographs."**

The experience is a digital fine-art photobook. Every pixel of interface chrome exists only to serve the photography.
* **Minimal:** Zero extraneous decorative elements, zero stickers, zero festive clutter.
* **Classy:** Classical museum proportions, generous whitespace, archival matting.
* **Quiet:** No competing accents; all color emanates strictly from the photographs themselves.
* **Apple-Inspired:** Fluid physical response, calibrated glass refraction, optical typography.
* **Spatial:** Real-world 3D depth planes rather than flat slides or web page blocks.

---

## 2. Color System

The palette is strictly monochromatic museum warm-white, ivory, and soft graphite.

### CSS Custom Properties
```css
:root {
  /* Museum Canvas & Backgrounds */
  --bg-canvas: #FAF9F6;        /* Warm archival ivory (Alabaster) */
  --bg-white: #FFFFFF;         /* Pure photographic matting white */
  --bg-dark: #0D0D0D;          /* Deep void for cinematic full-bleed */

  /* Typographic Ink Hierarchy */
  --text-primary: #1C1B19;     /* Deep carbon graphite (never harsh #000) */
  --text-secondary: #575653;   /* Warm slate subtitle */
  --text-muted: #8E8D8A;       /* Archival caption gray */
  --text-hairline: #E5E2DC;    /* 0.5px archival divider line */

  /* Apple Liquid Glass Tokens */
  --glass-bg: rgba(255, 255, 255, 0.78);
  --glass-blur: blur(24px) saturate(180%);
  --glass-border: 0.5px solid rgba(255, 255, 255, 0.65);
  --glass-rim: inset 0 0.5px 0.5px rgba(255, 255, 255, 0.95);
  --glass-highlight: inset 0 -0.5px 0.5px rgba(0, 0, 0, 0.04);
  --glass-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04);

  /* Elevation Shadows */
  --shadow-subtle: 0 12px 36px -8px rgba(0, 0, 0, 0.07);
  --shadow-deep: 0 24px 60px -15px rgba(0, 0, 0, 0.12);
}
```

### Prohibited Colors
* **No purple/cyan/magenta gradients.**
* **No artificial gold metallic gradients.**
* **No neon glows or saturated primary buttons.**

---

## 3. Typography Hierarchy

Strictly two typeface classifications:
1. **Curatorial Serif:** `Newsreader`, `Playfair Display`, or `Georgia` (optical sizing, italic emphasis).
2. **System Sans-Serif:** `-apple-system`, `BlinkMacSystemFont`, `SF Pro Display`, `Inter` (neutral, functional).

### Typographic Scale
* **Photo Title / Memory (Serif):** 16px–18px, `font-style: italic`, letter-spacing `-0.01em`, color `--text-primary`.
* **Archival Index (Sans):** 10px–11px, `font-weight: 500`, letter-spacing `0.08em`, uppercase, color `--text-muted`.
* **Glass Pill Counter (Sans):** 11px, `font-weight: 500`, tabular figures, letter-spacing `0.06em`, color `--text-secondary`.

---

## 4. Photographic Presentation Cadence

To prevent repetitive "card fatigue", the album employs 7 distinct compositional treatments:

| Index | Composition Style | Dimensions / Margins | Visual Role |
|---|---|---|---|
| **0** | **Archival Matting Portrait** | 300px × 410px image, 24px white border | Quiet opening, fine-art museum framing |
| **1** | **Full-Bleed Edge-to-Edge** | 100vw × 100dvh, 0px margins | Deep cinematic immersion; UI dims to 20% |
| **2** | **Asymmetric Fine-Art Print** | 290px × 370px, generous bottom white field | Contemplative breathing space, subtle caption |
| **3** | **Stereoscopic Dual Prints** | Two overlapping offset prints (front & back) | Real-time Z-depth differential parallax |
| **4** | **Cinematic Horizon Letterbox**| 346px × 236px panoramic crop | Expansive landscape balance |
| **5** | **Archival Contact Square** | 300px × 290px square format | Intimate snapshot / memory archival format |
| **6** | **Intimate Vignette Portrait** | 280px × 340px portrait | Warm closing moment; grounded completion |

---

## 5. Apple Liquid Glass Material Specification

The glass pill is the **only** piece of persistent system chrome.
* **Physicality:** It acts as a piece of curved, frosted optical silica hovering above the photographs.
* **Optical Saturation:** `saturate(180%)` enriches colors passing underneath the pill.
* **Hairline Rim:** 0.5px border mimicking light catching the edge of a bevel.
* **Contextual Invisibility:** When a full-bleed photograph (Index 1) fills the screen, the glass pill's opacity fades down to `0.20` so the viewer is immersed in the photograph without visual distraction.
* **Safe-Area Anchor:** Positioned at `bottom: calc(24px + env(safe-area-inset-bottom, 0px))` to clear the iOS home swipe indicator.

---

## 6. Spatial 3D Mechanics

* **Perspective Viewport:** `perspective: 1200px`, `perspective-origin: 50% 50%`.
* **Focal Plane:** $Z = 0$, `scale(1.0)`, `opacity: 1.0`.
* **Receding Transition ($K$):**
  * $Z: 0 \to -350\text{px}$ to $-400\text{px}$
  * Scale: $1.0 \to 0.86$
  * Pitch Tilt: $0^\circ \to -4.5^\circ$
  * Opacity: $1.0 \to 0.0$
* **Approaching Transition ($K+1$):**
  * $Z: +280\text{px} \to 0\text{px}$
  * Scale: $1.08 \to 1.00$
  * Pitch Tilt: $+3.5^\circ \to 0.0^\circ$
  * Opacity: $0.0 \to 1.0$

---

## 7. Motion & Easing Curve

All spatial tweens use the calibrated **Apple Cubic Bezier Curve**:
$$\text{cubic-bezier}(0.16, 1.0, 0.3, 1.0)$$
* **Duration:** 500ms to 550ms.
* **Tactile Characteristics:** Immediate, authoritative departure followed by a long, fluid, exponential settling into rest. Zero bouncy springs, zero cartoon oscillations.

---

## 8. Anti-Patterns & Prohibited Styling

| Anti-Pattern | Why It Is Prohibited | Correct Alternative |
|---|---|---|
| Rounded glass photo cards | Makes photos look like generic UI widgets | Unframed prints or paper-white matting |
| Floating particles / blobs | Distracts from photography; looks like generic AI template | Clean, warm-white empty space |
| Drop shadows with colored glow | Cheap "crypto/cyberpunk" aesthetic | Neutral, high-diffusion elevation shadows |
| Giant headline banners | Turns a private gift into a promotional website | Quiet 11px archival captions |
| Step-jumping swipe momentum | Causes accidental skips through multiple photos | Clamped 1-gesture = 1-photo state latch |
