---
title: 3D Omni-View Web Integration & Optimization
type: refactor
status: active
date: 2026-04-24
origin: docs/ideas/3d-omni-view-digital-twin.md
---

# 3D Omni-View Web Integration & Optimization

## Overview
The current 3D WebGL implementation (`web/3d/index.html`) successfully renders a block model with a timeline slider but struggles with responsiveness, frame drops, and lacks integration with the core Tailwind UI developed in `web/index.html`. This plan outlines the technical refactoring steps required to optimize the Three.js rendering loop, fix UI responsiveness, and seamlessly integrate the 2D HTML overlays into a unified, buttery-smooth Omni-View presentation.

## Problem Frame
- **UI Irresponsiveness:** The HTML elements floating above the canvas capture all pointer events, blocking canvas interaction in some cases. The manual animation loop in `startDisasterSimulation()` blocks the main thread aggressively and doesn't rely on delta time.
- **Performance Drops:** Rendering and updating 10,000+ water vertices iteratively on the CPU per frame (`web/3d/js/app.js` line ~300) causes heavy garbage collection and severe frame drops.
- **Fragmented Project:** The original 2D UI exists in `web/index.html` and the 3D experiment exists in `web/3d/`. They must be merged into one cohesive Hackathon presentation layer.

## Requirements Trace
- R1. Achieve constant 60 FPS rendering of the 3D macro-map.
- R2. Consolidate EOC, Logistics, and Tactical field views onto the 3D canvas with transparent Glass-Morphism overlays (from `web/index.html`).
- R3. Synchronize state across distinct client instances via a lightweight WebSocket server (currently at `web/3d/server.js`).
- R4. Fix UI blockage: ensure seamless transitioning between roles without blocking interactions on the slider and buttons.

## Scope Boundaries
- **Deferred to Separate Tasks:**
  - Real-time API bindings to external systems (Mocked pre-scripted data is still used).
  - High-fidelity textures or custom imported GLTF models (Using primitive geometry to guarantee rendering speed on all machines).

## Context & Research

### Relevant Code and Patterns
- `web/3d/js/app.js` - Current unoptimized Three.js setup.
- `web/index.html` - The Tailwind-based responsive 2D DOM layout.

### Key Technical Decisions
1. **GPU Offloading for Water:** Move the water wave math (sine/cosine) out of the CPU `animate()` loop and into a custom vertex shader (`THREE.ShaderMaterial`) to eliminate CPU overhead.
2. **Delta Time Loop:** Use `THREE.Clock` to measure elapsed time (`getDelta()`) ensuring animations run consistently regardless of monitor refresh rate.
3. **Pointer Events CSS:** Apply `pointer-events: none` to all non-interactive HUD panels floating over the canvas, and explicitly re-enable `pointer-events: auto` for buttons and sliders. This ensures the canvas and UI don't fight for focus.
4. **Single Unified Entry Point:** Merge `web/3d/index.html` logic into `web/index.html`. The app will consist of a fixed `#webgl-container` as the bottom z-index layer, with the Tailwind-styled HUDs floating above.

## Implementation Units

- [ ] **Unit 1: Refactor Animation Loop & Fix CPU Bottleneck**

**Goal:** Move wave animations to GPU and fix delta-time loops.
**Requirements:** R1
**Files:**
- Modify: `web/3d/js/app.js` (will later be moved to `web/js/app.js`)

**Approach:**
- Instantiate `const clock = new THREE.Clock();`.
- Update `requestAnimationFrame` loop to rely on `clock.getDelta()`.
- Replace `MeshStandardMaterial` for water with a custom `ShaderMaterial` passing `time` as a uniform for vertex displacement.

**Test scenarios:**
- Happy path: Canvas maintains 60 FPS while water animates continuously.
- Edge case: Minimized browser window pauses rendering without accumulating massive jumps in animation time.

- [ ] **Unit 2: Fix UI Irresponsiveness**

**Goal:** Ensure floating UI elements do not block canvas interaction and remain fully responsive.
**Requirements:** R4
**Files:**
- Modify: `web/3d/index.html` (CSS adjustments)

**Approach:**
- Apply `pointer-events: none;` to containers like `.hud-panel` and `#loading`.
- Apply `pointer-events: auto;` specifically to interactive children like `.role-btn`, `#timeline-slider`, and buttons.
- Convert raw CSS layouts to flexbox equivalent ensuring dynamic resizing without overlapping off-screen.

**Test scenarios:**
- Happy path: User can drag the slider without lag.
- Happy path: User can rotate/pan the 3D scene by clicking anywhere on the screen that isn't a button.

- [ ] **Unit 3: Unified Web Integration**

**Goal:** Merge the 3D Canvas into the main `web/index.html` and Tailwind architecture.
**Requirements:** R2
**Files:**
- Modify: `web/index.html`
- Create: `web/js/app.js` (moved and integrated from `web/3d/js/app.js`)
- Modify: `web/demo.js`

**Approach:**
- Insert `<div id="webgl-container" class="fixed inset-0 -z-10 pointer-events-auto"></div>` as the background in `web/index.html`.
- Wire `demo.js` logic to dispatch events to `app.js` (e.g., when "EOC Dashboard" button is clicked, trigger `updateCameraForRole('commander')` in the 3D scene).
- Bring over the Timeline slider logic from `web/3d/` and hook it into the Tailwind layout.

**Test scenarios:**
- Happy path: Clicking navigation tabs seamlessly switches both the DOM overlays (Tailwind panels) and the 3D camera angles.
- Integration: Triggering a HAM message in the DOM adds the visual fog-clearing effect in the 3D map.

- [ ] **Unit 4: WebSocket Synchronization**

**Goal:** Ensure multiple browser windows remain synced to the same disaster timeline.
**Requirements:** R3
**Files:**
- Modify: `web/3d/server.js` (Move to `web/server.js`)
- Modify: `web/js/app.js`

**Approach:**
- Configure a basic WebSocket server (e.g., using `ws` library or basic Node.js socket).
- Whenever a user (Commander) moves the disaster timeline slider, emit an event.
- All connected clients receive the event and smoothly lerp their local `disasterTime` to match the server state.

**Test scenarios:**
- Integration: Open two browser windows. Moving the slider in Window A perfectly syncs the water level and UI text in Window B.

## System-Wide Impact
- **Interaction graph:** `web/index.html` now acts as the single page application wrapper for both the HTML DOM elements and the Three.js canvas. `demo.js` orchestrates DOM changes while `app.js` orchestrates 3D changes, communicating via custom JavaScript events.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Cross-origin issues running WebGL textures locally | Serve `web/` using a proper local static server (`python -m http.server 8080`) during development and demo. |
| Shader compilation failure on older devices | Keep custom vertex shaders extremely simple (just a sine wave displacement, no complex normal mapping). |
| Out of memory error from resizing | Ensure `renderer.setSize` properly updates the camera projection matrix and doesn't re-instantiate WebGL contexts on window resize. |

## Sources & References
- **Origin document:** `docs/ideas/3d-omni-view-digital-twin.md`
