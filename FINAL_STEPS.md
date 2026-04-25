# 🏆 Hackathon Final Submission Checklist

Based on the `Hackathon Final Submission Guidelines.pdf`, here is the final checklist for the team to complete before the deadline. We have the code and the pitch script ready, so the focus is now on documentation and recording!

## 1. Mandatory Submissions

- [ ] **1.1 Project Presentation (PPT)**
  - Problem Statement: 72-hour communication blackout and siloed EOCs.
  - Solution Approach: S.C.L.I.D AI autonomous swarm orchestration.
  - Architecture / Workflow: Include the Unified Event Bus (UEB) and the 3-Agent Pipeline.
  - Tech Stack: Node.js, WebSockets, MiniMax M2.5, Tailwind, Pinggy.
  - Demo Screenshots: EOC Map, Logistics Routing, Mobile Field App.
  - Future Scope: On-device SLMs, RL for evacuation routes.
- [x] **1.2 Working Prototype / Demo**
  - Our Node.js + Pinggy multi-device setup covers this!
  - ⚠️ **CRITICAL PINGGY WARNING:** The free Pinggy tunnel expires exactly 60 minutes after you run the SSH command. Do not start the tunnel too early! Generate a fresh link 15 minutes before the pitch, and click "Visit Site" on the phone to bypass the warning screen before walking on stage.
- [ ] **1.3 Source Code Repository**
  - Push the latest commit to GitHub.
  - Ensure the repository is Public.
  - Verify the `README.md` looks good (it currently covers overview, setup, usage, and dependencies).
- [ ] **1.4 Project Report (3–5 Pages)**
  - Document to write: Abstract, Problem & Motivation, Methodology (Agent Swarm), Results (A* Time Savings), Conclusion.
  - **IMPORTANT: SDG Alignment:** Be sure to mention that S.C.L.I.D directly addresses the **UN Sustainable Development Goals (SDGs)** aligned with the Sendai Framework for Disaster Risk Reduction:
    - **SDG 11 (Sustainable Cities & Communities):** Target 11.5 reduces deaths/economic losses, while Target 11.b promotes holistic risk management.
    - **SDG 13 (Climate Action):** Target 13.1 strengthens resilience to climate-related hazards.
    - **SDG 9 (Industry, Innovation, and Infrastructure):** Developing resilient logistics infrastructure.
- [ ] **1.5 Demo Video (2–3 Minutes)**
  - Record a screen capture of the laptop and a camera view of the phone.
  - Use the `PITCH.md` script to narrate it!

## 2. Advanced / Bonus Submissions (Highly Recommended)

- [ ] **2.1 Pitch Deck (Startup Perspective)**
  - Value Proposition: High-stakes coordination with offline fallback protecting the UN SDGs.
  - Target Users: FEMA, NDRF, Local Fire/Police EOCs.
  - Business Model: Enterprise/Gov SaaS or licensing.
- [x] **2.2 MVP Deployment**
  - We are using Pinggy for live internet routing, proving it works over the web.
- [ ] **2.3 Innovation / Impact Note**
  - Emphasize the **HAM Radio Bridge (Dark Mode)** as our unique innovation for zero-connectivity environments.
