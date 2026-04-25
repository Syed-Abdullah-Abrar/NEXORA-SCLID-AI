# NEXORA-SCLID-AI: Disaster Copilot (Hackathon Final State)

NEXORA-SCLID-AI is a multi-agent orchestration framework for disaster management. It implements the "Disaster Copilot" vision (arXiv:2510.16034v2) using a Live LangGraph-style orchestrator powered by the MiniMax MLLM.

## 🚀 Live Demo Architecture
The project features a real-time, synchronized multi-screen simulation of a disaster in the city of **Krypton**.

### 1. The AI Brain (LangGraph Orchestrator)
- **Engine:** Node.js + WebSocket Server (`src/server.ts`)
- **Intelligence:** MiniMax 6.5 MLLM (`src/llm/MinimaxClient.ts`)
- **Logic:** The server takes the disaster narrative, feeds it to the MLLM, and dynamically decides which agent to trigger via the **Unified Event Bus (UEB)**.
- **Sync:** Broadcasts live state updates to all connected dashboards simultaneously.

### 2. Specialized Agent Pipeline
- **Early Warning Agent:** Ingests sensor data and predicts hazards.
- **Situational Awareness Agent:** Fuses multi-modal telemetry to update the common operating picture.
- **Resource Allocation Agent:** Calculates optimal rescue routes using the **A* Search Algorithm**.

### 3. Professional Command Dashboards
- **Presenter View (`/ai-view.html`):** Controls the narrative; shows LLM thought process and UEB logs.
- **EOC Dashboard (`/eoc.html`):** Macro city view with dynamic risk heatmaps.
- **Logistics Command (`/logistics.html`):** Live supply network with real-time A* path optimization.
- **Tactical Field View (`/field.html`):** High-contrast "Dark Mode" terminal with HAM Radio integration and AR compass.

## 🛠️ Installation & Setup

1. **Environment:**
   Create a `.env` file in the root directory:
   ```text
   MINIMAX_API_KEY=your_key_here
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the LangGraph Brain:**
   ```bash
   npm start
   ```

4. **Serve the Web Dashboards:**
   ```bash
   cd web && python3 -m http.server 8000
   ```

## 📜 The "City of Krypton" Script
The demo follows a high-stakes narrative defined in `web/story.js`:
- **Silver River Breach:** Predictive flooding detected by the EW Agent.
- **Highland Pass Landslide:** Infrastructure failure detected by Situational Awareness.
- **A* Optimization:** Resource Allocation Agent reroutes convoys via "Old Mine Trail."
- **HAM Rescue:** Decoding an SOS from "Krypton Library" in total blackout conditions.

## 🏁 Hackathon Pitch Info
Refer to `PITCH.md` for the minute-by-frame presentation script and the technical "Wow" moments.
