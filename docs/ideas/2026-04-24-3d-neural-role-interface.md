# 3D Neural-Role Interface (Hackathon Pitch Demo)

## Problem Statement
How might we build a captivating, responsive 3D web presentation that demonstrates the interconnected workflow of the EOC, organizations, and frontliners in a hypothetical disaster scenario, showcasing the AI's "brain" without relying on a static timeline model?

## Recommended Direction
**The "Neural Multiverse" Approach.**
We will merge the role-based interface with the neural network map. The screen consists of a central 3D canvas and dynamic, role-specific UI panels.
- **The 3D Canvas:** Instead of realistic water or fire, the 3D map is an abstract, glowing representation of the city. Nodes represent shelters, hospitals, and hazard zones. The connections between them are the "Neural Network" of the UEB and MLLM orchestrating the response.
- **The Presentation Flow (No Timeline Slider):** The presentation is driven by "Scenario Triggers" (e.g., a button that says "Simulate Bridge Collapse"). Clicking a trigger fires an event on the UEB.
- **Role-Based Views:** The presenter can switch between EOC, Logistics, and Field Marshall views.
    - *EOC View:* The 3D map zooms out. Neural links glow as the Early Warning Agent calculates cascading risks across the city nodes.
    - *Logistics View:* The map focuses on transport routes. When a "Bridge Collapse" is triggered, the neural links instantly recalculate to show the new optimized supply path.
    - *Field Marshall View:* The UI shifts to high-contrast Dark Mode. The 3D map shifts to a ground-level perspective, visualizing the incoming HAM radio data as it is digested by the Memory Bank and converted into an AR-style safe route.

## Key Assumptions to Validate
- [ ] **Performance:** Abstract node/link rendering in Three.js is significantly lighter than simulating fluid dynamics (water). We assume this will solve the current 60FPS performance issues.
- [ ] **Event-Driven UI:** We assume the Engineer can successfully refactor the `NexoraPipeline` to use an `EventEmitter` (UEB). The 3D animations will be directly triggered by these real-time events, not a hardcoded timeline array.
- [ ] **Data Structure:** We assume the current `MemoryArtifact` schema contains enough geospatial data (`lat`, `lon`, `tags`) to procedurally generate the 3D nodes on the map.

## MVP Scope
**IN:**
- A dark, wireframe 3D map of a hypothetical city block.
- Glowing nodes and edges representing the UEB data flow and resource routes.
- 3 distinct Tailwind CSS overlays for EOC, Logistics, and Field roles.
- "Scenario Buttons" (e.g., Inject Hazard, Simulate HAM Distress) to drive the demo interactively.
- Integration with the refactored `EventEmitter` backend.

**OUT:**
- Realistic disaster visuals (water planes, fire particle effects).
- The continuous timeline slider (replaced by discrete, impactful scenario triggers).

## Not Doing (and Why)
- **Fluid Dynamics/Water Sims:** Too heavy on the CPU/GPU, causing the irresponsiveness we are trying to fix.
- **Continuous Timeline:** A slider forces the presenter to scrub back and forth to find the "cool part." Discrete scenario buttons allow for a punchy, controlled pitch.

## Open Questions
- What are the specific 3 "Scenario Triggers" you want to click during the presentation to impress the judges? (e.g., 1. Flood Warning, 2. Bridge Collapse, 3. Civilian Distress Call).
