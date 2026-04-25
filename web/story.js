// ═══════════════════════════════════════════════════════════════
// S.C.L.I.D AI — Initial Dynamic Scenario Data
// ═══════════════════════════════════════════════════════════════

const THE_STORY = [
  {
    frame: 0,
    title: "S.C.L.I.D Online — Initial Intelligence Ingest",
    presenter_script: "The system is online. We are now ingesting raw data from across Krypton City. The S.C.L.I.D orchestrator is analyzing IoT sensors, social media trends, and emergency transcripts to build a Common Operating Picture.",
    raw_data: {
      iot: [
        { sensor_id: "WLVL-04", type: "water_level", current: "410mm/h", baseline: "12mm/h", trend: "RISING_EXPONENTIAL" },
        { sensor_id: "GRID-SUB-7", type: "electrical_leakage", status: "CRITICAL_GROUND_FAULT", location: "Sector 4 Riverside" }
      ],
      social_media: [
        { user: "@KryptonDirect", text: "Flood barriers in Riverside are leaking! #KryptonFlood", verified: true },
        { user: "@SafeTravels", text: "Highland Pass is looking dangerous. Small rocks falling on the road.", sentiment: "DANGER" }
      ],
      emergency_transcripts: [
        { id: "CAD-921", dispatch: "Unit 4 reporting water incursion at substation 4. Backup power engaged." },
        { id: "CAD-925", caller: "I'm trapped in my car on Riverside Dr. The water is rising too fast." }
      ]
    },
    ui_state: {
      active_page: '/eoc.html',
      eoc_map: { risk_visible: false, routes: [] },
      agent_statuses: { early_warning: 'idle', situational: 'idle', resource: 'idle' },
      ueb_log: "🟢 UEB [sys.init]: S.C.L.I.D ONLINE — Ingesting Live Data Streams...",
      memory_bank: []
    }
  }
];

// Export for both browser and Node.js
if (typeof window !== 'undefined') window.THE_STORY = THE_STORY;
if (typeof module !== 'undefined' && module.exports) module.exports = { THE_STORY };
