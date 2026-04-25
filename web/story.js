// ═══════════════════════════════════════════════════════════════
// S.C.L.I.D AI — The City of Krypton Data Story
// 7-Frame Cinematic Narrative for Hackathon Pitch
// ═══════════════════════════════════════════════════════════════

const THE_STORY = [
  {
    frame: 0,
    title: "S.C.L.I.D Online — Normal Operations",
    presenter_script: "Welcome to S.C.L.I.D AI. We are looking at Krypton — a city of 45,000 people sitting on the Silver River floodplain. Our S.C.L.I.D system is online, monitoring sensor feeds across the metropolitan area. All agents are idle.",
    chat_suggestion: "System status report",
    ui_state: {
      active_page: '/eoc.html',
      eoc_map: { risk_visible: false, routes: [] },
      agent_statuses: { early_warning: 'idle', situational: 'idle', resource: 'idle' },
      ueb_log: "🟢 UEB [sys.init]: S.C.L.I.D SYSTEM ONLINE — Ingesting [IoT Water Sensors], [Twitter/X API], and [911 Dispatch] feeds",
      memory_bank: []
    }
  },
  {
    frame: 1,
    title: "Anomalous Feed — Early Warning Activates",
    presenter_script: "The Early Warning Agent detects a massive 400mm spike in precipitation. Substation 4 is already reporting water ingress. The system queries the MiniMax M2.5 model to analyze the pattern against historical Krypton flood data from 1998. The system finds a 92% pattern match.",
    chat_suggestion: "Analyze Silver River flood risk",
    ui_state: {
      active_page: '/ai-view.html',
      eoc_map: { risk_visible: true, routes: [] },
      agent_statuses: { early_warning: 'processing', situational: 'idle', resource: 'idle' },
      ueb_log: "🧠 MLLM [data.ingest]: Querying MiniMax M2.5 — Analyzing [IoT_Sensor_Array_4] 400mm spike vs 1998 Flood Pattern...",
      memory_bank: [{ id: 'hist-1', source: 'LongTermMemory', data: '1998 Flood: 400mm rainfall in 6h resulted in Silver River breach. Substation 4 vulnerable.' }]
    }
  },
  {
    frame: 2,
    title: "Predictive Intelligence — CRITICAL Alert",
    presenter_script: "MiniMax confirms a 92% match. The Early Warning Agent issues a CRITICAL alert. The City's EOC map instantly highlights the predicted inundation zone across Sector 4. The power grid in Sector 4 just went offline.",
    chat_suggestion: "What areas are at highest risk?",
    ui_state: {
      active_page: '/eoc.html',
      eoc_map: { risk_visible: true, heatmap: 'critical' },
      agent_statuses: { early_warning: 'complete', situational: 'idle', resource: 'idle' },
      ueb_log: "🔴 UEB [hazard.detected]: [IoT_Grid_Monitor] CRITICAL Flood Imminent — Sector 4 Power Grid Offline",
      memory_bank: [{ id: 'ew-1', source: 'EarlyWarningAgent', data: '{ "match": 0.92, "severity": "CRITICAL", "hazard": "flood", "water_level": "4.2m", "threat_danger": "EXTREME", "flow_rate": "1200_cfs" }' }]
    }
  },
  {
    frame: 3,
    title: "Multi-Modal Fusion — The Landslide & Havoc",
    presenter_script: "It's cascading. Situational Awareness fuses drone video with social media distress tags. A landslide has hit Highland Pass — our primary supply route. Meanwhile, secondary electrical fires are breaking out in Sector 4. The city is paralyzed. We need a new plan.",
    chat_suggestion: "Generate alternate resource plan for Sector 4",
    ui_state: {
      active_page: '/logistics.html',
      eoc_map: { risk_visible: true, routes: [{ id: 'route-main', status: 'blocked' }] },
      agent_statuses: { early_warning: 'complete', situational: 'processing', resource: 'idle' },
      ueb_log: "🟡 UEB [situational.fusion]: Fusing [Drone_Video_04] + [Twitter_Distress_Tags] — Highland Pass BLOCKED, fires confirmed",
      memory_bank: [
        { id: 'ew-1', source: 'EarlyWarningAgent', data: '...' },
        { id: 'sa-1', source: 'SituationalAwarenessAgent', data: '{ "landslide": "confirmed", "route": "blocked", "fires": "Sector 4", "fire_class": "Class C Electrical", "threat_danger": "EXTREME", "affected": 12500 }' }
      ]
    }
  },
  {
    frame: 4,
    title: "Commander Trigger — A* Route Optimization",
    presenter_script: "Based on my direct command, S.C.L.I.D just activated the Resource Allocation Agent. It ran an A* pathfinding algorithm through the dense, hazardous city network. It perfectly routed around the floods and fires, finding the Old Mine Trail. Saving 3 hours of transport time.",
    chat_suggestion: "Show me the optimal supply route",
    ui_state: {
      active_page: '/logistics.html',
      eoc_map: { risk_visible: true, routes: [{ id: 'route-main', status: 'blocked' }, { id: 'route-optimal', status: 'active', is_optimal: true }] },
      agent_statuses: { early_warning: 'complete', situational: 'complete', resource: 'processing' },
      ueb_log: "🧠 MLLM: A* Optimization complete → Old Mine Trail selected. 180min saved.",
      memory_bank: [
        { id: 'ra-1', source: 'ResourceAllocationAgent', data: '{ "optimal_path": "Old Mine Trail", "time_saved": "180m", "convoys": 24 }' }
      ]
    }
  },
  {
    frame: 5,
    title: "Human-in-the-Loop — Commander Authorization",
    presenter_script: "The system is autonomous, but the Commander has final say. This is Human-in-the-Loop design. S.C.L.I.D awaits my authorization to deploy 45 rescue personnel via this new route.",
    chat_suggestion: "Authorize deployment of rescue team",
    ui_state: {
      active_page: '/eoc.html',
      eoc_map: { risk_visible: true, routes: [{ id: 'route-main', status: 'blocked' }, { id: 'route-optimal', status: 'active', is_optimal: true }] },
      agent_statuses: { early_warning: 'complete', situational: 'complete', resource: 'pending_approval' },
      ueb_log: "⏳ WAITING: Commander authorization required for Deployment Alpha — 45 personnel",
      memory_bank: []
    }
  },
  {
    frame: 6,
    title: "Dark Mode Rescue — HAM Radio Bridge",
    presenter_script: "Connectivity is lost. Cell towers are dead. The Field Marshall operates in total blackout — Dark Mode. S.C.L.I.D's HAM Radio Bridge decodes an SOS from 15 survivors trapped at Krypton Library. The AI projects the final-mile rescue route directly to their terminal. Offline. Decentralized. Life-saving.",
    chat_suggestion: "Decode SOS from Krypton Library",
    ui_state: {
      active_page: '/field.html',
      eoc_map: {},
      agent_statuses: { early_warning: 'complete', situational: 'complete', resource: 'complete' },
      ueb_log: "📡 HAM: DECODED SOS — KB1ABC: '15 TRAPPED AT KRYPTON LIBRARY' — 42.36°N, -71.05°W",
      memory_bank: [{ id: 'ham-1', source: 'HAMBridge', data: '{ "survivors": 15, "location": "Krypton Library", "coords": "42.36, -71.05" }' }]
    }
  }
];

// Export for both browser and Node.js
if (typeof window !== 'undefined') window.THE_STORY = THE_STORY;
if (typeof module !== 'undefined' && module.exports) module.exports = { THE_STORY };
