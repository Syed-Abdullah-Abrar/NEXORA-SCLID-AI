// The Cinematic Data Story for the NEXORA-SCLID-AI Hackathon Demo: City of Krypton
// Optimized with LLM Thought process and detailed agent integration

const THE_STORY = [
  {
    frame: 0,
    title: "Project NEXORA: Initializing",
    presenter_script: "Welcome to Project NEXORA. We are looking at Krypton, a city at risk. Our agents are currently idling, monitoring global sensor feeds.",
    ui_state: {
      active_page: '/eoc.html',
      eoc_map: { risk_visible: false, routes: [] },
      agent_statuses: { early_warning: 'idle', situational: 'idle', resource: 'idle' },
      ueb_log: "SYSTEM: NEXORA V2.0 ONLINE. Monitoring Silver River...",
      memory_bank: []
    }
  },
  {
    frame: 1,
    title: "Anomalous Feed Detected",
    presenter_script: "The Early Warning Agent detects a massive spike in precipitation. It's querying the MiniMax MLLM to analyze the pattern against historical Krypton flood data from 1998.",
    ui_state: {
      active_page: '/ai-view.html',
      eoc_map: { risk_visible: true, routes: [] },
      agent_statuses: { early_warning: 'processing', situational: 'idle', resource: 'idle' },
      ueb_log: "LLM: Querying MiniMax-6.5... Analyzing 1998 Flood Pattern parity...",
      memory_bank: [{ id: 'hist-1', source: 'LongTermMemory', data: '1998 Flood: 400mm rainfall in 6h resulted in Silver River breach.' }]
    }
  },
  {
    frame: 2,
    title: "Predictive Intelligence",
    presenter_script: "MiniMax confirms a 92% match. The Early Warning Agent issues a CRITICAL alert. The City's EOC map instantly highlights the predicted inundation zone.",
    ui_state: {
      active_page: '/eoc.html',
      eoc_map: { risk_visible: true, heatmap: 'critical' },
      agent_statuses: { early_warning: 'complete', situational: 'idle', resource: 'idle' },
      ueb_log: "EVENT: hazard.detected - Critical Flood Imminent in Sector 4.",
      memory_bank: [{ id: 'ew-1', source: 'EarlyWarningAgent', data: '{ "match": 0.92, "severity": "CRITICAL" }' }]
    }
  },
  {
    frame: 3,
    title: "Multi-Modal Fusion: The Landslide",
    presenter_script: "It's not just water. Situational Awareness fuzes drone video with social media distress tags. A landslide has just hit Highland Pass. The Unified Event Bus broadcasts the failure to all agencies.",
    ui_state: {
      active_page: '/logistics.html',
      eoc_map: { risk_visible: true, routes: [{ id: 'route-main', status: 'blocked' }] },
      agent_statuses: { early_warning: 'complete', situational: 'processing', resource: 'idle' },
      ueb_log: "UEB: [situational.fusion] Drone feed 04 confirms Highland Pass Blockage.",
      memory_bank: [
        { id: 'ew-1', source: 'EarlyWarningAgent', data: '...' },
        { id: 'sa-1', source: 'SituationalAwarenessAgent', data: '{ "landslide": "confirmed", "route": "blocked" }' }
      ]
    }
  },
  {
    frame: 4,
    title: "Resource Optimization: A* Recalculation",
    presenter_script: "The old supply route is gone. The Resource Allocation Agent runs A* pathfinding. It calculates an optimal path through the Old Mine Trail—saving 3 hours of transport time.",
    ui_state: {
      active_page: '/logistics.html',
      eoc_map: { risk_visible: true, routes: [{ id: 'route-main', status: 'blocked' }, { id: 'route-optimal', status: 'active', is_optimal: true }] },
      agent_statuses: { early_warning: 'complete', situational: 'complete', resource: 'processing' },
      ueb_log: "LLM: Running A* Optimization... Optimal Path found via Old Mine Trail.",
      memory_bank: [
        { id: 'ra-1', source: 'ResourceAllocationAgent', data: '{ "optimal_path": "Old Mine Trail", "time_saved": "180m" }' }
      ]
    }
  },
  {
    frame: 5,
    title: "Human-in-the-Loop Approval",
    presenter_script: "The system is autonomous, but the Commander has final say. One click approves the deployment of 45 rescue personnel via the new route.",
    ui_state: {
      active_page: '/eoc.html',
      eoc_map: { risk_visible: true },
      agent_statuses: { early_warning: 'complete', situational: 'complete', resource: 'pending_approval' },
      ueb_log: "WAITING: Commander approval required for Deployment Alpha.",
      memory_bank: []
    }
  },
  {
    frame: 6,
    title: "Dark Mode Rescue: HAM Bridge",
    presenter_script: "Connectivity is lost. The Field Marshall operates in Dark Mode. NEXORA's HAM Radio Bridge decodes an SOS. The AI projects the final-mile rescue route directly to their terminal.",
    ui_state: {
      active_page: '/field.html',
      eoc_map: {},
      agent_statuses: { early_warning: 'complete', situational: 'complete', resource: 'complete' },
      ueb_log: "HAM: DECODED SOS - KB1ABC: '15 trapped at library'.",
      memory_bank: [{ id: 'ham-1', source: 'HAMBridge', data: 'Location: 42.36, -71.05' }]
    }
  }
];

window.THE_STORY = THE_STORY;
