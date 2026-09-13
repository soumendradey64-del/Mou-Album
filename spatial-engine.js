/**
 * ============================================================================
 * SPATIAL PHOTO ALBUM — PURE 7-PHOTO GESTURE & 3D ANIMATION ENGINE
 * ============================================================================
 * 
 * Direct Product Paradigm:
 * OPEN WEBSITE → PHOTO 1 → SCROLL → PHOTO 2 → SCROLL → ... → PHOTO 7
 * Zero book covers, zero colophons, zero chapter breaks.
 * 
 * Exact Indexed Architecture:
 * - 7 Discrete States: Indices 0 to 6.
 * - State 0 is Photo 1 immediately in focal focus (Z = 0, scale 1.0, opacity 1.0).
 * - 3D Spatial Depth:
 *   Photo K recedes in Z space (Z = -350px, scale 0.88, opacity 0).
 *   Photo K+1 emerges from depth into focal focus (Z = 0, scale 1.0, opacity 1.0).
 * - Bulletproof Gesture Normalization:
 *   - 1 gesture = strictly 1 photo transition (Hard Swipe Clamp).
 *   - 1:1 tactile drag preview with iOS rubberband resistance at boundaries.
 *   - 550ms transition latch: locks all triggers during interpolation.
 *   - Debounced trackpad/wheel accumulator: eliminates momentum skips.
 *   - Desktop keyboard review: ArrowDown / ArrowUp / PageDown / PageUp / Home / End.
 * - Fluid Weighted Apple Easing:
 *   - Analytical cubic-bezier(0.16, 1.0, 0.3, 1.0) solver.
 * 
 * @module SpatialAlbumEngine
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SpatialAlbumEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ==========================================================================
  // APPLE CUBIC BEZIER (0.16, 1.0, 0.3, 1.0) ANALYTICAL SOLVER
  // ==========================================================================
  function createAppleEase(p1x = 0.16, p1y = 1.0, p2x = 0.3, p2y = 1.0) {
    const cx = 3.0 * p1x;
    const bx = 3.0 * (p2x - p1x) - cx;
    const ax = 1.0 - cx - bx;

    const cy = 3.0 * p1y;
    const by = 3.0 * (p2y - p1y) - cy;
    const ay = 1.0 - cy - by;

    function sampleX(t) {
      return ((ax * t + bx) * t + cx) * t;
    }

    function sampleY(t) {
      return ((ay * t + by) * t + cy) * t;
    }

    function sampleDerivativeX(t) {
      return (3.0 * ax * t + 2.0 * bx) * t + cx;
    }

    function solveX(x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) {
        const xEst = sampleX(t) - x;
        if (Math.abs(xEst) < 1e-5) return sampleY(t);
        const dX = sampleDerivativeX(t);
        if (Math.abs(dX) < 1e-6) break;
        t -= xEst / dX;
      }
      let t0 = 0.0, t1 = 1.0;
      t = x;
      while (t0 < t1) {
        const xEst = sampleX(t);
        if (Math.abs(xEst - x) < 1e-5) return sampleY(t);
        if (x > xEst) t0 = t;
        else t1 = t;
        t = (t1 + t0) * 0.5;
      }
      return sampleY(t);
    }

    return function ease(x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      return solveX(x);
    };
  }

  const appleEase = createAppleEase(0.16, 1.0, 0.3, 1.0);

  // Universal Animation Frame helpers
  const raf = typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame
    : (typeof window !== 'undefined' && window.requestAnimationFrame
        ? window.requestAnimationFrame.bind(window)
        : (cb) => setTimeout(() => cb(Date.now()), 16));

  const caf = typeof cancelAnimationFrame === 'function'
    ? cancelAnimationFrame
    : (typeof window !== 'undefined' && window.cancelAnimationFrame
        ? window.cancelAnimationFrame.bind(window)
        : (id) => clearTimeout(id));

  // iOS Rubberband Resistance for Boundaries (Photo 1 pull-down, Photo 7 push-up)
  function rubberband(offset, factor = 0.28) {
    return (offset / (1.0 + Math.abs(offset) * 1.6)) * factor;
  }

  // Linear Interpolation
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Value Clamping
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // ==========================================================================
  // SPATIAL ALBUM ENGINE CLASS
  // ==========================================================================
  class SpatialAlbumEngine {
    constructor(options = {}) {
      // Configuration
      this.options = Object.assign({
        containerSelector: '#albumCanvas, #frameContainer',
        planeSelector: '.spatial-plane, .photo-plane',
        totalPhotos: 7,
        transitionDuration: 550,     // 550ms transition latch
        swipeRangePx: 260,           // Pixels of vertical drag for 1 full photo preview
        distanceThreshold: 0.22,     // 22% drag threshold to commit transition
        velocityThreshold: 0.40,     // px/ms flick threshold to commit transition
        wheelThreshold: 60,          // Accumulated wheel deltaY to trigger state change
        wheelDebounceMs: 180,        // Trackpad idle rest duration before re-arming wheel
        enablePointerEvents: true,   // Allow desktop mouse grab-and-drag preview
        onStateChange: null,         // Callback(stateIndex, photoPlaneEl)
        onProgress: null             // Callback(continuousState, normalizedProgress)
      }, options);

      // DOM Elements Cache
      this.dom = {};
      this.photoPlanes = [];
      this.totalPhotos = this.options.totalPhotos;
      this.cacheElements();

      // State Management (Photo 1 is Index 0)
      this.currentState = 0;         // Discrete integer: 0 to 6
      this.displayState = 0;          // Continuous float for 3D rendering: 0.0 to 6.0
      this.targetState = 0;           // Transition destination integer
      this.isTransitioning = false;   // 550ms Lock flag: blocks gestures during animation
      this.transitionStartTime = 0;
      this.transitionDuration = this.options.transitionDuration;
      this.transitionStartState = 0;
      this.animFrameId = null;

      // Accessibility: Reduced Motion Support
      this.reducedMotionQuery = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
      this.prefersReducedMotion = this.reducedMotionQuery ? this.reducedMotionQuery.matches : false;
      if (this.reducedMotionQuery) {
        this.reducedMotionQuery.addEventListener('change', (e) => {
          this.prefersReducedMotion = e.matches;
          this.renderSpatial(this.displayState);
        });
      }

      // Gesture State (Touch & Mouse Drag)
      this.isDragging = false;
      this.activePointerId = null;
      this.dragStartY = 0;
      this.dragStartX = 0;
      this.dragFraction = 0;         // Clamped strictly to [-1.0, 1.0]
      this.touchHistory = [];         // Rolling buffer for velocity calculation

      // Trackpad & Wheel Normalization
      this.wheelAccumulator = 0;
      this.wheelLocked = false;
      this.wheelDebounceTimer = null;

      // Bind Event Handlers
      this.handleTouchStart = this.handleTouchStart.bind(this);
      this.handleTouchMove = this.handleTouchMove.bind(this);
      this.handleTouchEnd = this.handleTouchEnd.bind(this);
      this.handlePointerDown = this.handlePointerDown.bind(this);
      this.handlePointerMove = this.handlePointerMove.bind(this);
      this.handlePointerUp = this.handlePointerUp.bind(this);
      this.handleWheel = this.handleWheel.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.animationTick = this.animationTick.bind(this);

      // Initialize
      this.init();
    }

    // ------------------------------------------------------------------------
    // DOM CACHING & PHOTO PLANE DISCOVERY
    // ------------------------------------------------------------------------
    cacheElements() {
      const get = (id) => document.getElementById(id);
      this.dom.container = document.querySelector(this.options.containerSelector) || document.body;

      // Strip legacy cover and colophon endings if present
      const legacyCover = get('planeCover');
      if (legacyCover) {
        legacyCover.style.display = 'none';
        legacyCover.style.pointerEvents = 'none';
      }
      const legacyEnding = get('planeEnding');
      if (legacyEnding) {
        legacyEnding.style.display = 'none';
        legacyEnding.style.pointerEvents = 'none';
      }

      // Discover 7 photo planes: either by IDs plane-0..plane-6 or by query
      this.photoPlanes = [];
      for (let i = 0; i < this.options.totalPhotos; i++) {
        const pById = get(`plane-${i}`) || get(`planePhoto${i + 1}`);
        if (pById) this.photoPlanes.push(pById);
      }

      // Fallback query if numbered IDs not found
      if (this.photoPlanes.length === 0) {
        const allPlanes = Array.from(document.querySelectorAll(this.options.planeSelector));
        this.photoPlanes = allPlanes.filter(el => el !== legacyCover && el !== legacyEnding && !el.classList.contains('cover-plane'));
      }

      this.totalPhotos = this.photoPlanes.length > 0 ? this.photoPlanes.length : this.options.totalPhotos;

      // Dual Card Parallax elements (Photo 4)
      this.dom.dualFront = get('dualFront') || get('dualCardFront');
      this.dom.dualBack = get('dualBack') || get('dualCardBack');

      // Apple Glass Controller & Inspector UI
      this.dom.glassPill = get('glassPill');
      this.dom.glassFill = get('glassFill');
      this.dom.glassLabel = get('glassLabel') || get('glassIndex');
      this.dom.progressPercent = get('progressPercent') || get('scrollPercentDisplay');
      this.dom.photoButtons = Array.from(document.querySelectorAll('.photo-pill, .chapter-pill'));
      this.dom.scrollDriver = get('scrollDriver');
    }

    // ------------------------------------------------------------------------
    // INITIALIZATION & EVENT ATTACHMENT
    // ------------------------------------------------------------------------
    init() {
      // 1. Deactivate old scroll driver runway if present
      if (this.dom.scrollDriver) {
        this.dom.scrollDriver.style.display = 'none';
        this.dom.scrollDriver.style.pointerEvents = 'none';
      }

      // 2. Prevent mobile browser gesture takeover & set grab styling
      const cont = this.dom.container;
      if (cont) {
        cont.style.touchAction = 'none';
        cont.style.userSelect = 'none';
        cont.style.webkitUserSelect = 'none';
        cont.style.cursor = 'grab';
      }

      // 3. Attach Mobile Touch Listeners to Container
      cont.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      window.addEventListener('touchend', this.handleTouchEnd, { passive: false });
      window.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });

      // 4. Attach Desktop Pointer Events (for 1:1 tactile mouse drag preview)
      if (this.options.enablePointerEvents) {
        cont.addEventListener('pointerdown', this.handlePointerDown);
        window.addEventListener('pointermove', this.handlePointerMove);
        window.addEventListener('pointerup', this.handlePointerUp);
        window.addEventListener('pointercancel', this.handlePointerUp);
      }

      // 5. Attach Trackpad / Wheel Listener (Normalized with Debounce Latch)
      cont.addEventListener('wheel', this.handleWheel, { passive: false });
      window.addEventListener('wheel', (e) => {
        if (cont.contains(e.target) || e.target === document.body || e.target === document.documentElement) {
          this.handleWheel(e);
        }
      }, { passive: false });

      // 6. Attach Keyboard Review (ArrowDown / ArrowUp / PageDown / PageUp)
      window.addEventListener('keydown', this.handleKeyDown);

      // 7. Wire Photo Switcher / Scrubber Buttons
      this.dom.photoButtons.forEach((btn, idx) => {
        btn.onclick = (e) => {
          e.preventDefault();
          this.goToState(idx);
        };
      });

      // 8. Public hook on window
      window.jumpTo = (idx) => this.goToState(idx);

      // 9. Initial Spatial Render: Photo 1 immediately in focal focus at Z = 0!
      this.displayState = 0;
      this.currentState = 0;
      this.renderSpatial(0);
      this.updateUI(0);
    }

    // ------------------------------------------------------------------------
    // TOUCH GESTURE HANDLING (1:1 Drag Preview + Resistance + Velocity)
    // ------------------------------------------------------------------------
    handleTouchStart(e) {
      // 550ms Transition lock: ignore inputs while an animation is actively settling
      if (this.isTransitioning) {
        e.preventDefault();
        return;
      }

      // Ignore multi-touch (pinches, 2-finger taps)
      if (e.touches.length > 1) return;

      const touch = e.touches[0];
      this.isDragging = true;
      this.dragStartY = touch.clientY;
      this.dragStartX = touch.clientX;
      this.dragFraction = 0;

      const now = performance.now();
      this.touchHistory = [{ y: touch.clientY, t: now }];
    }

    handleTouchMove(e) {
      if (!this.isDragging || this.isTransitioning) return;
      if (e.touches.length > 1) return;

      const touch = e.touches[0];
      const currentY = touch.clientY;
      const dy = currentY - this.dragStartY;

      // Prevent native browser scroll and pull-to-refresh
      e.preventDefault();

      // Track touch point in rolling buffer (last 120ms)
      const now = performance.now();
      this.touchHistory.push({ y: currentY, t: now });
      while (this.touchHistory.length > 2 && (now - this.touchHistory[0].t) > 120) {
        this.touchHistory.shift();
      }

      // Drag fraction calculation:
      // Dragging UP (dy < 0) advances toward next photo (positive fraction)
      const rawFraction = -dy / this.options.swipeRangePx;

      // Boundary Rubberband Resistance:
      if (this.currentState === 0 && rawFraction < 0) {
        // Pulling down past Photo 1: elastic resistance
        this.dragFraction = -rubberband(-rawFraction);
      } else if (this.currentState === (this.totalPhotos - 1) && rawFraction > 0) {
        // Pushing up past Photo 7: elastic resistance
        this.dragFraction = rubberband(rawFraction);
      } else {
        // Hard swipe clamp: a single gesture CANNOT advance more than 1 photo
        this.dragFraction = clamp(rawFraction, -1.0, 1.0);
      }

      // Immediate 1:1 tactile visual tracking
      this.displayState = this.currentState + this.dragFraction;
      this.renderSpatial(this.displayState);
      this.updateUI(this.displayState);

      if (typeof this.options.onProgress === 'function') {
        const maxIdx = Math.max(1, this.totalPhotos - 1);
        this.options.onProgress(this.displayState, clamp(this.displayState / maxIdx, 0, 1));
      }
    }

    handleTouchEnd(e) {
      if (!this.isDragging) return;
      this.isDragging = false;

      // Calculate release velocity from history buffer (px/ms)
      const now = performance.now();
      let velocity = 0;
      if (this.touchHistory.length >= 2) {
        const oldest = this.touchHistory[0];
        const newest = this.touchHistory[this.touchHistory.length - 1];
        const dt = newest.t - oldest.t;
        if (dt > 10) {
          velocity = (newest.y - oldest.y) / dt; // negative = flick upward
        }
      }

      this.evaluateGestureCommit(this.dragFraction, velocity);
    }

    // ------------------------------------------------------------------------
    // DESKTOP POINTER (MOUSE) DRAG PREVIEW
    // ------------------------------------------------------------------------
    handlePointerDown(e) {
      if (e.pointerType === 'touch') return; // Handled by touch events
      if (this.isTransitioning) return;
      if (e.button !== 0) return; // Primary click only

      this.isDragging = true;
      this.activePointerId = e.pointerId;
      this.dragStartY = e.clientY;
      this.dragStartX = e.clientX;
      this.dragFraction = 0;

      if (this.dom.container) {
        this.dom.container.style.cursor = 'grabbing';
      }

      const now = performance.now();
      this.touchHistory = [{ y: e.clientY, t: now }];

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (_) {}
    }

    handlePointerMove(e) {
      if (!this.isDragging || e.pointerId !== this.activePointerId || this.isTransitioning) return;

      const dy = e.clientY - this.dragStartY;
      const rawFraction = -dy / this.options.swipeRangePx;

      const now = performance.now();
      this.touchHistory.push({ y: e.clientY, t: now });
      while (this.touchHistory.length > 2 && (now - this.touchHistory[0].t) > 120) {
        this.touchHistory.shift();
      }

      if (this.currentState === 0 && rawFraction < 0) {
        this.dragFraction = -rubberband(-rawFraction);
      } else if (this.currentState === (this.totalPhotos - 1) && rawFraction > 0) {
        this.dragFraction = rubberband(rawFraction);
      } else {
        this.dragFraction = clamp(rawFraction, -1.0, 1.0);
      }

      this.displayState = this.currentState + this.dragFraction;
      this.renderSpatial(this.displayState);
      this.updateUI(this.displayState);
    }

    handlePointerUp(e) {
      if (!this.isDragging || e.pointerId !== this.activePointerId) return;
      this.isDragging = false;
      this.activePointerId = null;

      if (this.dom.container) {
        this.dom.container.style.cursor = 'grab';
      }

      let velocity = 0;
      if (this.touchHistory.length >= 2) {
        const oldest = this.touchHistory[0];
        const newest = this.touchHistory[this.touchHistory.length - 1];
        const dt = newest.t - oldest.t;
        if (dt > 10) velocity = (newest.y - oldest.y) / dt;
      }

      this.evaluateGestureCommit(this.dragFraction, velocity);
    }

    // ------------------------------------------------------------------------
    // GESTURE THRESHOLD & HARD SWIPE CLAMP COMMIT LOGIC
    // ------------------------------------------------------------------------
    evaluateGestureCommit(fraction, velocity) {
      const distThresh = this.options.distanceThreshold;
      const velThresh = this.options.velocityThreshold;

      let target = this.currentState;

      // Advance Forward (Dragging up or flicking up)
      if (fraction > 0) {
        if (fraction >= distThresh || velocity <= -velThresh) {
          target = Math.min(this.totalPhotos - 1, this.currentState + 1);
        } else {
          target = this.currentState; // Snap back
        }
      }
      // Advance Backward (Dragging down or flicking down)
      else if (fraction < 0) {
        if (fraction <= -distThresh || velocity >= velThresh) {
          target = Math.max(0, this.currentState - 1);
        } else {
          target = this.currentState; // Snap back
        }
      }

      // Hard clamp: target can NEVER be more than 1 photo away from currentState
      target = clamp(target, Math.max(0, this.currentState - 1), Math.min(this.totalPhotos - 1, this.currentState + 1));

      this.animateToState(target, this.displayState);
    }

    // ------------------------------------------------------------------------
    // TRACKPAD / WHEEL NORMALIZATION ENGINE
    // Eliminates trackpad flick skipping via accumulation and debounced latch.
    // ------------------------------------------------------------------------
    handleWheel(e) {
      e.preventDefault();

      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 22;      // DOM_DELTA_LINE
      else if (e.deltaMode === 2) delta *= 400; // DOM_DELTA_PAGE

      // Reset trackpad rest timer on every wheel event
      clearTimeout(this.wheelDebounceTimer);
      this.wheelDebounceTimer = setTimeout(() => {
        // Trackpad momentum has completely ceased
        this.wheelLocked = false;
        this.wheelAccumulator = 0;
      }, this.options.wheelDebounceMs);

      // If locked or already transitioning: discard to prevent multi-skips
      if (this.wheelLocked || this.isTransitioning) {
        return;
      }

      // Accumulate wheel delta
      this.wheelAccumulator += delta;

      // Check threshold for single photo advance
      if (this.wheelAccumulator >= this.options.wheelThreshold) {
        if (this.currentState < this.totalPhotos - 1) {
          this.wheelLocked = true;
          this.wheelAccumulator = 0;
          this.nextState();
        } else {
          this.wheelAccumulator = 0;
        }
      } else if (this.wheelAccumulator <= -this.options.wheelThreshold) {
        if (this.currentState > 0) {
          this.wheelLocked = true;
          this.wheelAccumulator = 0;
          this.previousState();
        } else {
          this.wheelAccumulator = 0;
        }
      }
    }

    // ------------------------------------------------------------------------
    // KEYBOARD NAVIGATION (Desktop Review)
    // ------------------------------------------------------------------------
    handleKeyDown(e) {
      if (this.isTransitioning) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          this.nextState();
          break;

        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          this.previousState();
          break;

        case 'Home':
          e.preventDefault();
          this.goToState(0);
          break;

        case 'End':
          e.preventDefault();
          this.goToState(this.totalPhotos - 1);
          break;
      }
    }

    // ------------------------------------------------------------------------
    // STATE TRANSITION CONTROLLER & ANIMATION LATCH (550ms Lock)
    // ------------------------------------------------------------------------
    nextState() {
      if (this.currentState < this.totalPhotos - 1) {
        this.goToState(this.currentState + 1);
      }
    }

    previousState() {
      if (this.currentState > 0) {
        this.goToState(this.currentState - 1);
      }
    }

    goToState(targetIndex, options = {}) {
      const target = clamp(Math.round(targetIndex), 0, this.totalPhotos - 1);
      if (this.isTransitioning && !options.force) return;

      this.animateToState(target, this.displayState, options);
    }

    animateToState(target, fromState = this.displayState, options = {}) {
      if (this.animFrameId) {
        caf(this.animFrameId);
      }

      this.targetState = target;
      this.transitionStartState = fromState;
      this.isTransitioning = true; // Engage 550ms lock
      this.transitionStartTime = performance.now();

      // Dynamic duration scaling: snap-backs over tiny distance are snappier
      const distance = Math.abs(this.targetState - this.transitionStartState);
      if (this.prefersReducedMotion) {
        this.transitionDuration = 220; // Calm, dignified cross-fade
      } else if (distance < 0.25) {
        this.transitionDuration = Math.max(260, Math.round(this.options.transitionDuration * Math.sqrt(distance)));
      } else {
        this.transitionDuration = this.options.transitionDuration; // 550ms
      }

      this.animFrameId = raf(this.animationTick);
    }

    animationTick(now) {
      const elapsed = now - this.transitionStartTime;
      const normalizedTime = clamp(elapsed / this.transitionDuration, 0, 1);

      // Apply Apple cubic-bezier(0.16, 1.0, 0.3, 1.0)
      const easedFactor = appleEase(normalizedTime);
      this.displayState = lerp(this.transitionStartState, this.targetState, easedFactor);

      // Render 3D spatial stack & UI at current interpolated frame
      this.renderSpatial(this.displayState);
      this.updateUI(this.displayState);

      if (typeof this.options.onProgress === 'function') {
        const maxIdx = Math.max(1, this.totalPhotos - 1);
        this.options.onProgress(this.displayState, clamp(this.displayState / maxIdx, 0, 1));
      }

      if (normalizedTime < 1) {
        this.animFrameId = raf(this.animationTick);
      } else {
        // Settle state precisely
        this.displayState = this.targetState;
        this.currentState = this.targetState;
        this.isTransitioning = false; // Release 550ms lock
        this.animFrameId = null;

        this.renderSpatial(this.currentState);
        this.updateUI(this.currentState);

        if (typeof this.options.onStateChange === 'function') {
          this.options.onStateChange(this.currentState, this.photoPlanes[this.currentState]);
        }
      }
    }

    // ------------------------------------------------------------------------
    // 3D SPATIAL TRANSFORMATION ENGINE (PURE PHOTO STACK)
    // Photo K recedes in Z space (Z = -350px, scale 0.88, opacity 0).
    // Photo K+1 emerges from depth into focal focus (Z = 0, scale 1.0, opacity 1.0).
    // ------------------------------------------------------------------------
    renderSpatial(s) {
      const planes = this.photoPlanes;
      const total = planes.length;
      if (total === 0) return;

      for (let i = 0; i < total; i++) {
        const plane = planes[i];
        if (!plane) continue;

        const diff = i - s; // 0 when active, +1 when coming up, -1 when passed

        // Active visibility range: only current and immediately adjacent planes
        if (Math.abs(diff) <= 1.25) {
          plane.style.display = 'flex';

          // Accessibility: Reduced Motion Cross-fade
          if (this.prefersReducedMotion) {
            plane.style.transform = 'none';
            const opacity = Math.max(0, 1.0 - Math.abs(diff));
            plane.style.opacity = opacity.toFixed(3);
            if (Math.abs(diff) < 0.5) plane.classList.add('active');
            else plane.classList.remove('active');
            continue;
          }

          let z = 0;
          let scale = 1.0;
          let opacity = 1.0;
          let rotX = 0;

          if (diff === 0) {
            // Exactly in focal focus
            z = 0;
            scale = 1.0;
            opacity = 1.0;
            rotX = 0;
            plane.classList.add('active');
            plane.style.zIndex = 10;
          } else if (diff < 0) {
            // Photo K recedes in Z space (Z -> -350px, scale -> 0.88, opacity -> 0)
            const u = Math.min(1.0, Math.abs(diff));
            z = -350 * u;
            scale = 1.0 - 0.12 * u; // 1.0 -> 0.88
            opacity = Math.max(0, 1.0 - u * 1.18);
            rotX = -u * 4; // Subtle spatial tilt as it recedes
            plane.classList.remove('active');
            plane.style.zIndex = 5;
          } else {
            // Photo K+1 emerges from depth into focal focus (Z: -260px -> 0px, scale: 0.90 -> 1.0, opacity: 0 -> 1.0)
            const u = Math.min(1.0, diff); // 1 -> 0 as s approaches i
            z = -260 * u;
            scale = 0.90 + 0.10 * (1.0 - u); // 0.90 -> 1.0
            opacity = Math.max(0, (1.0 - u) * 1.15 - 0.15);
            rotX = u * 3;
            plane.classList.remove('active');
            plane.style.zIndex = 8;
          }

          // Boundary rubberbanding
          if (i === 0 && diff > 0 && s < 0) {
            const stretch = Math.abs(s);
            z = stretch * 75;
            scale = 1.0 + stretch * 0.08;
            opacity = 1.0;
          } else if (i === (total - 1) && diff < 0 && s > (total - 1)) {
            const stretch = s - (total - 1);
            z = -350 - stretch * 75;
            scale = 0.88 + stretch * 0.06;
            opacity = 1.0;
          }

          plane.style.transform = `translate3d(0, 0, ${z.toFixed(1)}px) scale(${scale.toFixed(3)}) rotateX(${rotX.toFixed(2)}deg)`;
          plane.style.opacity = opacity.toFixed(3);
        } else {
          // Cull inactive planes completely for 60fps GPU performance
          plane.style.display = 'none';
          plane.classList.remove('active');
        }
      }

      // Stereoscopic differential parallax for Photo 4 (Dual Prints, index 3)
      if (this.dom.dualFront && this.dom.dualBack && s >= 2.0 && s <= 4.0) {
        const pDelta = (s - 3.0) * 45;
        this.dom.dualFront.style.transform = `translate3d(${(pDelta * 0.6).toFixed(1)}px, ${(-pDelta * 0.4).toFixed(1)}px, 60px) rotate(2deg)`;
        this.dom.dualBack.style.transform = `translate3d(${(-pDelta * 0.8).toFixed(1)}px, ${(pDelta * 0.5).toFixed(1)}px, -120px) rotate(-3deg)`;
      }

      // Vanishing pill during Full-Bleed immersion (Photo 2 / index 1)
      if (this.dom.glassPill) {
        if (Math.abs(s - 1.0) < 0.45) {
          this.dom.glassPill.style.opacity = '0.25';
        } else {
          this.dom.glassPill.style.opacity = '1.0';
        }
      }
    }

    // ------------------------------------------------------------------------
    // UI SYNCHRONIZATION
    // Updates the Apple glass pill, percentage inspector, and photo switcher.
    // ------------------------------------------------------------------------
    updateUI(s) {
      const maxIdx = Math.max(1, this.totalPhotos - 1);
      const normalizedProgress = clamp(s / maxIdx, 0, 1);
      const activeIdx = clamp(Math.round(s), 0, this.totalPhotos - 1);

      // Percentage / Photo Counter Display in Header
      const photoNum = String(activeIdx + 1).padStart(2, '0');
      const totalNum = String(this.totalPhotos).padStart(2, '0');

      if (this.dom.progressPercent) {
        this.dom.progressPercent.textContent = `${photoNum} / ${totalNum}`;
      }

      // Apple Glass Pill Fill Bar (percentage of total album journey)
      if (this.dom.glassFill) {
        const fillFraction = ((s + 1) / this.totalPhotos) * 100;
        this.dom.glassFill.style.width = `${fillFraction.toFixed(1)}%`;
      }

      // Glass Text Label: Clean Photo Index "01 / 07"
      if (this.dom.glassLabel) {
        this.dom.glassLabel.textContent = `${photoNum} / ${totalNum}`;
      }

      // Photo Switcher Pills
      if (this.dom.photoButtons && this.dom.photoButtons.length > 0) {
        this.dom.photoButtons.forEach((btn, idx) => {
          if (idx === activeIdx) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }
    }

    // ------------------------------------------------------------------------
    // PUBLIC API
    // ------------------------------------------------------------------------
    getState() {
      return this.currentState;
    }

    getDisplayState() {
      return this.displayState;
    }

    getTotalPhotos() {
      return this.totalPhotos;
    }

    isLocked() {
      return this.isTransitioning;
    }

    // ------------------------------------------------------------------------
    // CLEANUP / DESTROY
    // ------------------------------------------------------------------------
    destroy() {
      if (this.animFrameId) caf(this.animFrameId);
      clearTimeout(this.wheelDebounceTimer);

      const cont = this.dom.container;
      cont.removeEventListener('touchstart', this.handleTouchStart);
      window.removeEventListener('touchmove', this.handleTouchMove);
      window.removeEventListener('touchend', this.handleTouchEnd);
      window.removeEventListener('touchcancel', this.handleTouchEnd);

      if (this.options.enablePointerEvents) {
        cont.removeEventListener('pointerdown', this.handlePointerDown);
        window.removeEventListener('pointermove', this.handlePointerMove);
        window.removeEventListener('pointerup', this.handlePointerUp);
        window.removeEventListener('pointercancel', this.handlePointerUp);
      }

      cont.removeEventListener('wheel', this.handleWheel);
      window.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  // Export metadata
  SpatialAlbumEngine.appleEase = appleEase;

  return SpatialAlbumEngine;
}));
