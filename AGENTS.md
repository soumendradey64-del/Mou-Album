# Multi-Agent Operating Guidelines & Directives (AGENTS.md)
## Project: Mobile Spatial Photo Album (E-Album)

**Applies to:** All autonomous coding agents, subagents, and review agents working in this repository.  
**Repository Root:** `c:\Users\soume\Desktop\Album`

---

## 1. Project Purpose

To build an Apple-restrained, mobile-first spatial digital photo album. The website is opened on a mobile device via a scanned QR code. The user experiences an indexed, tactile photographic journey where one deliberate vertical gesture transitions one photograph to the next using physical 3D depth, subtle glass material, and quiet typography.

---

## 2. Repository Boundaries & Git Safety

* **Root Location:** All project files live strictly inside `c:\Users\soume\Desktop\Album`.
* **Prohibited Actions:**
  * **DO NOT** create nested repositories (`git init` inside this directory or subdirectories).
  * **DO NOT** move or clone the project into temporary or alternate paths.
  * **DO NOT** overwrite parent git history (`C:/Users/soume` contains the parent `.git`).
  * **DO NOT** work outside the current directory unless explicitly commanded.

---

## 3. Mandatory Reading Order for Future Agents

Before making any non-trivial code modifications, any incoming agent MUST read the following files in order:
1. `PRD.md` — The locked product definition, core user journey, and non-goals.
2. `DESIGN.md` — The visual north star, color tokens, typography scales, glass physics, and composition rules.
3. `RULES.md` — Non-negotiable engineering and design constraints.
4. `ARCHITECTURE.md` — State machine design, gesture model, rendering pipeline, and file structure.
5. `MEMORY.md` & `DECISIONS.md` — Historical context, rejected directions, and locked rationale.
6. `TESTING.md` — Quality verification protocols and gesture test matrices.

---

## 4. Documentation Maintenance Rule

* **Persistent Project Memory:** The 10 root markdown files (`PRD.md`, `AGENTS.md`, `DESIGN.md`, `ARCHITECTURE.md`, `RULES.md`, `MEMORY.md`, `DECISIONS.md`, `TESTING.md`, `IMPLEMENTATION-PLAN.md`, `README.md`) are the authoritative source of truth.
* Whenever architectural decisions or feature implementations change:
  * You must update the corresponding markdown file immediately.
  * Log significant changes in `DECISIONS.md`.
  * Verify that no contradiction is introduced across documentation.

---

## 5. The Anti-Yesman Rule

* **Do not optimize for sycophantic approval.**
* Do not agree with a design proposal or feature addition simply because the user suggested it or because it is technically trivial to build.
* If any suggestion harms:
  * Visual restraint and elegance,
  * Mobile performance or frame rate (60fps),
  * Tactile gesture predictability,
  * Conceptual simplicity, or
  * Codebase maintainability,
  **YOU MUST RESPECTFULLY CHALLENGE IT.** Explain the architectural or aesthetic cost and provide a superior, restrained alternative.

---

## 6. The Anti-AI-Slop Rule

* Agents frequently hallucinate "fancy" UI elements when asked to build creative products:
  * Floating purple/cyan neon orbs,
  * Gradient pills and glowing borders,
  * Excessive rounded glass cards,
  * Decorative particle systems,
  * Generic SaaS bento grids,
  * Motivational quotes, chapter banners, and birthday fanfare.
* **Strict Ban:** All of the above are strictly banned.
* If an element can be removed without degrading the user's focus on the photography, **REMOVE IT IMMEDIATELY.**

---

## 7. No-Guessing & No-Invented-Requirements Rules

* **Do Not Guess Project State:** Inspect files, scripts, and runtime output directly before asserting state. If a detail is unverified, write `UNKNOWN — VERIFY`.
* **Do Not Invent Content:** Do NOT add chapters, timelines, birthday letters, poems, celebration triggers, audio music tracks, or marketing CTAs unless explicitly instructed in written project requirements.
* **The Photographs ARE the content.**

---

## 8. Multi-Agent Roles & Specialization

When utilizing subagents or teamwork modes, strictly assign single-responsibility ownership:

* **Role A: Art Director / Visual Architect**
  * Owns typography optical scaling, breathing margins, aspect ratio framing, color restraint, and composition cadence.
* **Role B: Spatial & Material Engineer**
  * Owns 3D perspective math, CSS matrix transforms, Apple liquid glass shader/backdrop formulas, and GPU draw calls.
* **Role C: Gesture & Interaction Engineer**
  * Owns touch listener normalization, pointer drag previews, velocity thresholds, transition latching, and keyboard review fallbacks.
* **Role D: Media & Data Architect**
  * Owns the decoupled album data model, responsive picture element queries, and lookahead preloading logic.
* **Role E: Mobile QA & Performance Critic**
  * Audits 360px–430px viewports, tests edge cases (rapid swipes, boundary pulls, address bar shifts), and verifies 60fps frame timing.

The **Lead Coordinating Agent** reviews all outputs, validates against `RULES.md`, and performs the final integration.

---

## 9. Testing & Verification Behavior

* **Evidence Before Assertions:** Never claim an animation is smooth or a layout works on mobile without empirical verification (e.g., headless script execution, viewport inspection, console error check, HTTP status check).
* Run tests matching the criteria outlined in `TESTING.md`.
