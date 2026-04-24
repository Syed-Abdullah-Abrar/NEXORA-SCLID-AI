# NEXORA-SCLID-AI: Figma Design Specification

## Overview
This document provides exact specifications for the Figma Engineer to build the "Omni-View" Hackathon Demo for the NEXORA-SCLID-AI Disaster Copilot. The demo consists of three distinct views representing different layers of the disaster relief body.

**CRITICAL DIRECTIVE:** The second LLM (the Coder) will be parsing this Figma file to build the frontend. You MUST act as a "System Architect" and strictly follow the guidelines in Section 1 to ensure the Figma file is "Coder-Ready."

---

## 1. Figma System Architecture Guidelines (Coder-Ready Constraints)

To ensure perfect translation from Figma to Code (React/Tailwind), the Figma file MUST adhere to these rules:

### A. The "Auto Layout" Law
- **Never use fixed positions (X/Y coordinates).**
- Every frame, container, and component MUST use **Auto Layout**.
- Specify layout behavior explicitly: `Fill`, `Hug`, or `Fixed` for width/height.
- Define `gap` and `padding` explicitly for every container.

### B. Semantic Naming (The "Code-First" Rule)
- Layer names must reflect their HTML/Component equivalent (BEM convention preferred).
- **Forbidden:** `Frame 1`, `Rectangle 4`, `Group 12`.
- **Required:** `section#hero-map`, `button.primary-large`, `nav.sidebar-left`, `div.agent-node`.

### C. Variables & Tokens (No Hardcoded Values)
- **Hardcoded hex codes are forbidden.**
- Define and use a strict Figma Variable/Token system for:
  - **Colors:** `bg-brand-primary`, `surface-dark`, `text-on-dark`, `status-critical`, `status-warning`.
  - **Spacing:** `spacing-sm` (8px), `spacing-md` (16px), `spacing-lg` (24px).
  - **Radii:** `radius-sm`, `radius-md`, `radius-full`.

### D. Atomic Hierarchy & State Maps
- Build from the bottom up (Atoms → Molecules → Organisms).
- Create a dedicated "Component Library" page in Figma before assembling the main views.
- **Interactive State Maps:** Every interactive component (buttons, agent nodes, alerts) must have a variant set showing `Default`, `Hover`, `Active`, and `Disabled` states side-by-side.

### E. Component Documentation (Hidden Metadata)
- Utilize Figma's "Component Description" field to document logic for the Coding LLM.
- Examples: 
  - *"Target API: UEB Subscribe `hazard.detected`"*
  - *"Data Injection Slot: `MemoryArtifact.data.message`"*
  - *"Accessibility: `role="alert"`"*

---

## 2. Design System Tokens (Initial Palette)

**Theme:** High-Contrast, Dark Mode "Cyber-Tactical"
- `bg-base`: `#0F172A` (Tailwind slate-900)
- `surface-panel`: `#1E293B` (Tailwind slate-800)
- `border-subtle`: `#334155` (Tailwind slate-700)
- `text-primary`: `#F8FAFC` (Tailwind slate-50)
- `text-secondary`: `#94A3B8` (Tailwind slate-400)
- `accent-agent`: `#3B82F6` (Tailwind blue-500) - For the MLLM/Task Planner
- `status-warning`: `#F59E0B` (Tailwind amber-500) - For Early Warning
- `status-critical`: `#EF4444` (Tailwind red-500) - For Immediate Hazards
- `status-success`: `#10B981` (Tailwind emerald-500) - For Safe Routes

---

## 3. The "Omni-View" Screens (Frames)

### Screen 1: The EOC Command Dashboard (The Glass-Box Flex)
**User:** Head Commander
**Focus:** Early Warning Agent & MLLM Orchestrator
**Layout:** Desktop (1440x900)

*   **Structure:**
    *   `div.layout-grid`: Auto Layout, Row direction, 70/30 split.
*   **Left Panel (70%): `section#macro-map`**
    *   Dark-themed, minimalist map component.
    *   Overlays: Procedurally generated "Risk Heatmaps" (use `status-warning` and `status-critical` gradients with 40% opacity).
*   **Right Panel (30%): `aside#glass-box-orchestrator`**
    *   Visual style: Glass-morphism (background blur, subtle white border).
    *   Contains the **Task Dependency Graph**.
    *   Nodes: `[Query Input]` -> `[Early Warning]` -> `[Situational]` -> `[Resource]`.
    *   Edges: Animated glowing lines connecting the nodes.
    *   **Metadata Note:** *"This section visualizes the `TaskPlanner` generating a `TaskGraph`."*

### Screen 2: Siloed Organizations (The Timeline & Triage)
**User:** Logistics Manager & Hospital Director
**Focus:** Situational Awareness Agent & Unified Event Bus (UEB)
**Layout:** Desktop Split-Screen (1440x900)

*   **Structure:**
    *   `div.split-view-container`: Auto Layout, Row direction, 50/50 split.
    *   Bottom docked bar: `nav.crisis-timeline` (scrolling ticker tape).
*   **Left Half (Logistics View): `section#logistics-dashboard`**
    *   Theme: Orange/Amber accents.
    *   Components: `card.bottleneck-alert`, `list.inventory-feed`, `map.route-optimization`.
*   **Right Half (Medical View): `section#hospital-dashboard`**
    *   Theme: Blue/Teal accents.
    *   Components: `card.incoming-casualties`, `list.bed-capacity`, `map.ambulance-routes`.
*   **The "Wow" Interaction Layer:**
    *   A central modal or overlay `div.ueb-sync-event` that bridges both halves.
    *   When the "Drone Footage Processed" event fires, both halves highlight specific components to show instantaneous, synced updates.

### Screen 3: The Dark Mode Rescue (The Tactical Field)
**User:** Field Marshall / Frontliner
**Focus:** Resource Allocation Agent & HAM Radio Bridge
**Layout:** Mobile (390x844)

*   **Structure:**
    *   Ultra-minimalist, high-contrast (Black background, Neon Green/Amber text).
*   **Top Header: `header#signal-status`**
    *   Shows "Cloud: Disconnected" (Red) | "HAM/APRS: Linked" (Green).
*   **Main Body: `div.terminal-log`**
    *   Monospace font (e.g., Fira Code or JetBrains Mono).
    *   Scrolling text components simulating AX.25 Packet decoding and APRS telemetry.
*   **Action Area: `div.field-actions`**
    *   Massive, accessible `button.push-to-talk` (Primary Action).
    *   **Metadata Note:** *"On click, simulates `VoiceSynthesizer` capturing audio and converting to text for the UEB."*
    *   A prominent glowing compass/arrow component `svg.safe-route-indicator` pointing to the dynamically allocated safe zone.

---

## 4. Required Atomic Components Inventory

The Figma Designer MUST build these as Master Components before assembling the screens:

1.  **`Card.AgentNode`**: Represents a specialized agent. Variants: `Idle`, `Processing`, `Completed`, `Error`.
2.  **`Alert.UEBMessage`**: Represents a data packet on the Event Bus. Variants: `Info`, `Warning`, `Critical`.
3.  **`Map.HeatmapOverlay`**: Reusable map layers for hazards.
4.  **`List.MemoryArtifact`**: A row item representing a log in the Memory Bank.
5.  **`Button.Action`**: Standard UI buttons. Variants: `Primary`, `Secondary`, `Ghost`, `Danger`. Size: `SM`, `MD`, `LG`.
6.  **`Terminal.LogLine`**: Monospace text component for the HAM Radio view.

## 5. Handoff Checklist for Coder LLM

Before exporting or handing off to the frontend developer/Coding LLM, verify:
- [x] Are all frames using Auto Layout?
- [x] Are there NO "magic numbers" (fixed absolute coordinates)?
- [x] Are all colors mapped to Figma Variables?
- [x] Are layers named semantically (e.g., `section#hero`, `ul.inventory-list`)?
- [x] Are component descriptions populated with intended API endpoints or logic?

---
## 6. Implementation Status
**COMPLETED:** The Omni-View Figma design has been successfully implemented in `web/index.html`.
- **Auto Layout:** Translated to CSS Flexbox & Grid via TailwindCSS.
- **Variables:** Integrated as custom theme extensions in the Tailwind configuration.
- **Semantic Naming:** Applied consistently across all DOM elements.
- **Interactivity:** Integrated with `demo.js` to simulate the event bus and pipeline flows in real-time.

---

## 7. 3D Digital Twin (Three.js Implementation)

**Location:** `web/3d/index.html` (standalone) and `web/js/app.js` (integrated)

### Overview
Built 3D synchronized sandbox per `docs/ideas/3d-omni-view-digital-twin.md`.

### Features Implemented
1. **Three Synchronized Views** (role selector in HUD):
   - **Commander (Top-Down):** Macro 3D city view, agent status panel, time-travel slider
   - **Field Marshal (Fog of War):** Tactical view, fog reveals on HAM bursts, intelligence coverage %
   - **Civilian (AR Overlay):** Ground-level with glowing route arrow to shelter

2. **3D Environment:**
   - Procedural city grid with buildings (no external GLTF dependency)
   - GPU-based water shader (ShaderMaterial) for 60 FPS
   - Critical infrastructure markers (hospital, shelters)
   - Grid overlay and atmospheric fog

3. **Disaster Simulation:**
   - Time slider (0-100%) controls water level
   - Delta-time animation loop using THREE.Clock
   - Pre-scripted events: warnings, hazards, HAM bursts, success states

4. **WebSocket Sync Server:**
   - `web/3d/server.js` - Node.js WebSocket server
   - Syncs timeline across multiple browser windows

### Tech Stack
- **Renderer:** Vanilla Three.js r128 (CDN)
- **Styling:** Pure CSS + Tailwind with Orbitron + Rajdhani fonts
- **Sync:** WebSocket server (ws library)

### Running
```bash
cd web/3d && node server.js  # Start sync server
# Open index.html in browser(s)
```

### Unified Web App
The 3D canvas is now integrated into `web/index.html` as a background layer with Tailwind UI overlays on top. The main app has 4 views: 3D View, EOC Dashboard, Organizations, Field Rescue.
