# S.C.L.I.D AI — Hackathon Pitch & Demo Script

## Acronym
**S.C.L.I.D** — Swarm Co-Pilot for Logistics and Intelligent Dispatch

---

## Pre-Pitch Setup (Multi-Device Demo)

To create a "wow" moment, you will use your actual smartphone as the Field Marshall's device. We use **Pinggy** to tunnel through the venue's Wi-Fi firewall instantly.

1. Run `npm run start` in your first terminal.
2. Open a second terminal and run: `ssh -p 443 -R0:localhost:8080 a.pinggy.io`
3. Scan the QR code or copy the URL it prints (e.g., `https://something.a.pinggy.link`).
4. On your smartphone, open that URL and add `/field.html` to the end.
5. Leave the phone screen on, face down or in your pocket until Act 6.

---

## The Hook (0:00 – 0:45)

**Presenter:** "When disaster strikes, the first casualty is communication. In the critical first 72 hours, the cloud goes down. EOCs are left blind. Agencies are siloed. People die waiting for coordination that never comes."

*[Pause. Landing page visible — shield icon, 4 role cards.]*

"This is **S.C.L.I.D AI** — an autonomous, multi-agent AI orchestration framework that thinks, adapts, and routes resources in real-time. Powered by the MiniMax M2.5 frontier model. Even when the internet is gone."

---

## The Architecture (0:45 – 1:30)

**Presenter:** "S.C.L.I.D uses a live LangGraph-style orchestrator. Three specialized AI agents — Early Warning, Situational Awareness, and Resource Allocation — communicate over a Unified Event Bus. Every decision is stored in a 3-tier Memory Bank. Every output is traceable."

*[Click into AI Orchestrator view — show UEB Log, Agent Pipeline, Memory Bank]*

"And crucially — the Commander can speak directly to the AI brain. Watch."

---

## Why S.C.L.I.D? (The Tech & The Impact) (1:30 – 2:00)

**Presenter:** "How do we make this possible? We built S.C.L.I.D using a highly specialized, lightweight tech stack designed for speed and reliability:
- **Core Orchestration:** Node.js backend acting as a LangGraph-style agent orchestrator via a Unified Event Bus.
- **Front-End Visualization:** Vanilla JS, TailwindCSS, and dynamic SVG rendering for zero-latency, highly dense map interfaces.
- **LLM Intelligence:** Powered by **MiniMax M2.5**, parsing unstructured data into military-grade `[SITREP]` structures.
- **Connectivity:** Real-time WebSockets with **Pinggy** SSH tunneling, enabling seamless multi-device synchronization over cellular networks.

**The Impact on Disaster Relief Bodies:**
1. **De-siloing Agencies:** The Unified Event Bus means fire, police, and logistics EOCs share a single Common Operating Picture instantly.
2. **Saving Hours in Logistics:** Real-time A* pathfinding calculates safe supply routes in milliseconds, saving crucial hours of transport time.
3. **Zero-Connectivity Operations:** Through our simulated HAM Radio Bridge, field units can transmit SOS packets even when the 5G grid collapses."

---

## The Live Demo: City of Krypton (2:00 – 4:00)

### Act 1: The Warning (Frame 1-2)
*[Press NEXT twice to reach Frame 2]*

"Krypton City. 45,000 people. Silver River is rising fast. Our Early Warning Agent just detected a 400mm rainfall spike and queried MiniMax against the 1998 flood data. It's a 92% match. The EOC map instantly highlights the predicted inundation zone. Substation 4 just went offline."

*[Switch to EOC Command — show red heatmap and flood warnings pulsing]*

### Act 2: The Commander Speaks ⭐
*[Type in chat: "Analyze Sector 4 flood risk"]*

"I'm going to ask S.C.L.I.D directly. Watch the AI respond with tactical intelligence, formatting a strict SITREP using real data from our sensor network."

*[Wait for M2.5 response in the strict [SITREP] format.]*

### Act 3: Cascading Failure (Frame 3)
*[Press NEXT to reach Frame 3]*

"It's cascading. Situational Awareness fuses drone video with social media distress tags. A landslide has hit Highland Pass — our primary supply route. Secondary electrical fires are breaking out across Sector 4. The city's primary logistics network is paralyzed."

*[Switch to Logistics — show BLOCKED marker on Highland Pass and background hazards]*

### Act 4: Chat Triggers the Pipeline ⭐
*[Type in chat: "Generate alternate resource plan for Sector 4"]*

"S.C.L.I.D doesn't just report problems. When I give a direct command, it activates the entire agent pipeline. Watch the status badges cascade."

*[All 3 agent badges visibly cascade. Press NEXT to reach Frame 4.]*

"Our Resource Allocation Agent just ran an **A-star pathfinding algorithm** through the dense, hazardous city network. It flawlessly routed around the floods and fires, finding the Old Mine Trail. Saving **3 hours** of transport time."

*[Show green optimal route glowing on map.]*

### Act 5: Authorization (Frame 5)
*[Press NEXT to reach Frame 5]*

"The system is autonomous, but the Commander has final say. S.C.L.I.D awaits my authorization to deploy 45 rescue personnel via this new route."

### Act 6: Dark Mode (Frame 6)
*[Press NEXT to reach Frame 6. Pull out your smartphone and hold it up for the judges to see.]*

"Final mile. Cell towers are dead. Our Field Marshall is in total blackout. But S.C.L.I.D's HAM Radio Bridge just decoded an SOS — **15 survivors trapped at Krypton Library**. The AI projects an AR-style navigation path directly to their terminal. Offline. Decentralized. Life-saving."

*(Bonus ⭐: Type "15 civilians trapped, need extract" on your phone's TX input and hit SEND to show two-way field reporting!)*

---

## The Future (4:00 – 5:00)

**Presenter:** "What you just saw was a **live AI brain** orchestrating a complex, multi-screen disaster response in real-time."

"We're moving S.C.L.I.D to:
- **On-device SLMs** for true edge deployment
- **Reinforcement Learning** for dynamic evacuation routes
- **Misinformation filtering** for HAM radio intercepts"

"We don't build dashboards. We build **the future of resilience**."

"Thank you."

---

## Chat Demo Cheat Sheet

| Frame | Suggested Chat Input | Expected Response |
|-------|---------------------|-------------------|
| 0 | "System status report" | [SITREP] All agents idle. |
| 1 | "Analyze Silver River flood risk" | [SITREP] Flood analysis with 1998 data points. |
| 2 | "What areas are at highest risk?" | [SITREP] Sector 4 grid offline. |
| 3 | "Generate alternate resource plan for Sector 4" | ⭐ **Triggers Resource pipeline.** |
| 5 | "Authorize deployment of rescue team" | [ACTION] Deployment confirmed. |
| 6 | *(On Phone)* "Need immediate medevac at Library" | [ACTION] SCLID broadcasts medevac priority. |
