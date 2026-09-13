# Mobile Spatial Photo Album (E-Album)

> **A minimal, Apple-restrained, mobile-first spatial digital photobook.**  
> Built for direct browser access via mobile QR code scan.

---

## 1. What This Project Is

This repository contains the **production frontend UI/UX** of a spatial digital photo album.
* **Pure Photography-First:** No cover screens, no chapter breaks, no birthday clichés, no marketing copy. The photographs **are** the content.
* **Controlled 3D Traversal:** Navigating the album is driven by an indexed state machine ($S \in \{0, 1, \dots, N-1\}$). Exactly one deliberate vertical swipe transitions one photograph to the next using physical 3D depth, scale, and subtle pitch tilt.
* **Apple Liquid Glass HUD:** A single, physical frosted glass pill at the bottom indicates progress and automatically dims during edge-to-edge full-bleed photography.

---

## 2. Quickstart & How to Run

The album is built using zero-dependency modern web standards (ES6+ / CSS3 3D / HTML5). No compilation, transpilation, or heavy `node_modules` are required.

### Local Development Server
Start any local static server from the repository root:

```bash
# Python 3
python -m http.server 3000 --bind 0.0.0.0

# Or Node npx serve
npx serve -p 3000
```

### Accessing on Mobile Phone
1. Connect your mobile device to the same Wi-Fi network as your workstation.
2. Find your local workstation IP address (`ipconfig` on Windows).
3. Open your mobile browser (Safari / Chrome) and navigate to:
   ```
   http://<YOUR_LOCAL_IP>:3000
   ```
   *(Example: `http://192.168.29.233:3000`)*

---

## 3. Repository Structure & Content Location

```
c:\Users\soume\Desktop\Album/
├── PRD.md                     # Product Requirements Document
├── AGENTS.md                  # Multi-agent operating guidelines & directives
├── DESIGN.md                  # Visual design, typography, & glass specs
├── ARCHITECTURE.md            # Technical architecture & subsystem design
├── RULES.md                   # Non-negotiable project rules & constraints
├── MEMORY.md                  # Persistent knowledge & locked facts
├── DECISIONS.md               # Architectural Decision Records (ADRs)
├── TESTING.md                 # Test suites & QA verification protocols
├── IMPLEMENTATION-PLAN.md     # 15-phase implementation roadmap
├── README.md                  # Project overview & developer guide (this file)
│
├── index.html                 # Production entrypoint & viewport shell
├── preview.html               # Development staging harness
├── spatial-engine.js          # Core gesture state machine & 3D interpolation engine
├── album-data.js              # Decoupled album photographic data model
└── assets/
    └── qr-code.png            # Static QR code for mobile testing
```

### Where Album Content Is Defined
* All photographs, titles, captions, and layout styles are defined in [`album-data.js`](./album-data.js).
* To add, remove, or reorder photos, edit only `album-data.js`. The UI dynamically adapts.

---

## 4. Documentation Hierarchy for Future Agents

Before making code changes, any agent working in this repository **MUST** read the following documents in order:
1. [`PRD.md`](./PRD.md) — Locked product definition & core user journey.
2. [`DESIGN.md`](./DESIGN.md) — Visual north star, palette tokens, typography scales, glass material specs.
3. [`RULES.md`](./RULES.md) — Hard constraints (anti-yesman rule, anti-AI-slop, hard single-swipe clamp).
4. [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Subsystem details, state model, rendering pipeline.
5. [`TESTING.md`](./TESTING.md) — Viewport matrices and gesture QA verification.

---

## 5. Useful Commands

| Task | Command |
|---|---|
| Start local server | `python -m http.server 3000 --bind 0.0.0.0` |
| Verify HTTP status | `powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing).StatusCode"` |
| Check listening port | `powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue"` |
| Check local Wi-Fi IP | `powershell -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi*').IPAddress"` |
