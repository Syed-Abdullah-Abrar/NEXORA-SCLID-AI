// The Cinematic Data Story for the NEXORA-SCLID-AI Hackathon Demo

export const THE_STORY = [
  // Frame 0: The Calm Before
  {
    frame: 0,
    title: "Normal Operations",
    presenter_script: "It's a normal day at the EOC. The system is monitoring, but all is calm.",
    ui_state: {
      active_page: '/eoc.html',
      eoc_map: { risk_visible: false, routes: [] },
      agent_statuses: { early_warning: 'idle', situational: 'idle', resource: 'idle' },
      ueb_log: "System Nominal. Awaiting Data...",
      memory_bank: []
    }
  },
  // Frame 1: The Initial Warning
  {
    frame: 1,
    title: "The Initial Warning",
    presenter_script: "Suddenly, the Early Warning Agent detects anomalous sensor data. It predicts a severe flood event and flags high-risk zones on the EOC map.",
    ui_state: {
      active_page: '/eoc.html',
      eoc_map: { risk_visible: true, routes: [] },
      agent_statuses: { early_warning: 'processing', situational: 'idle', resource: 'idle' },
      ueb_log: "EVENT: hazard.detected - Flood risk elevated in Zone A.",
      memory_bank: [{ id: 'ew-1', source: 'EarlyWarningAgent', data: '{ "hazard": "flood" }' }]
    }
  },
  // Frame 2: The Cascading Failure
  {
    frame: 2,
    title: "Cascading Failure",
    presenter_script: "As the flood hits, a key bridge collapses. The Situational Awareness Agent processes this, updating the central map. The old supply route is now impassable.",
    ui_state: {
      active_page: '/logistics.html',
      eoc_map: { risk_visible: true, routes: [{ id: 'route-12', status: 'blocked' }] },
      agent_statuses: { early_warning: 'complete', situational: 'processing', resource: 'idle' },
      ueb_log: "EVENT: infrastructure.failure - Bridge at grid 7B collapsed.",
      memory_bank: [
        { id: 'ew-1', source: 'EarlyWarningAgent', data: '{ "hazard": "flood" }' },
        { id: 'sa-1', source: 'SituationalAwarenessAgent', data: '{ "bridge_7B": "collapsed" }' }
      ]
    }
  },
  // Frame 3: The Human in the Loop
  {
    frame: 3,
    title: "Human in the Loop",
    presenter_script: "The system has a plan, but for high-stakes decisions, it requires human approval. The EOC Commander sees the full picture and gives the go-ahead.",
    ui_state: {
      active_page: '/eoc.html',
      eoc_map: { risk_visible: true, routes: [{ id: 'route-12', status: 'blocked' }] },
      agent_statuses: { early_warning: 'complete', situational: 'complete', resource: 'pending_approval' },
      ueb_log: "AWAITING HUMAN_IN_LOOP: Approve AI-generated resource plan?",
      memory_bank: [
        { id: 'ew-1', source: 'EarlyWarningAgent', data: '{ "hazard": "flood" }' },
        { id: 'sa-1', source: 'SituationalAwarenessAgent', data: '{ "bridge_7B": "collapsed" }' }
      ]
    }
  },
  // Frame 4: The Optimal Path (The "Wow" Moment)
  {
    frame: 4,
    title: "Optimal Path Recalculation",
    presenter_script: "With approval, the Resource Allocation Agent runs its A* pathfinding algorithm. It instantly calculates a new, optimal supply route that bypasses the collapsed bridge, saving critical time.",
    ui_state: {
      active_page: '/logistics.html',
      eoc_map: { risk_visible: true, routes: [{ id: 'route-12', status: 'blocked' }, { id: 'route-14-alt', status: 'active', is_optimal: true }] },
      agent_statuses: { early_warning: 'complete', situational: 'complete', resource: 'processing' },
      ueb_log: "EVENT: resource.plan.generated - Optimal route calculated via A*.",
      memory_bank: [
        { id: 'ew-1', source: 'EarlyWarningAgent', data: '{ "hazard": "flood" }' },
        { id: 'sa-1', source: 'SituationalAwarenessAgent', data: '{ "bridge_7B": "collapsed" }' },
        { id: 'ra-1', source: 'ResourceAllocationAgent', data: '{ "plan": "FLOOD_HIGH_XYZ", "optimal_route": "route-14-alt" }' }
      ]
    }
  },
  // Frame 5: The Dark Mode Rescue
  {
    frame: 5,
    title: "Dark Mode Rescue",
    presenter_script: "Meanwhile, a field marshall in a total communication blackout zone receives a distress call via HAM radio. They switch to the Dark Mode Field Ops view.",
    ui_state: {
      active_page: '/field.html',
      eoc_map: {}, // Map is not the focus here
      agent_statuses: { early_warning: 'complete', situational: 'complete', resource: 'complete' },
      ueb_log: "EVENT: ham.burst.received - Civilian distress call, Zone C.",
      memory_bank: [
        /* previous artifacts */
        { id: 'ham-1', source: 'HAMBridgeService', data: '{ "distress_call": "true" }' }
      ]
    }
  },
  // Frame 6: The Final Mile
  {
    frame: 6,
    title: "The Final Mile",
    presenter_script: "The AI calculates the final-mile safe route from the marshall's position to the civilian, displayed as a simple AR overlay. Mission complete.",
    ui_state: {
      active_page: '/field.html',
      eoc_map: {},
      agent_statuses: { early_warning: 'complete', situational: 'complete', resource: 'complete' },
      ueb_log: "EVENT: field.route.generated - Final mile rescue path sent.",
      memory_bank: [
        /* all artifacts */
        { id: 'field-route-1', source: 'ResourceAllocationAgent', data: '{ "target": "civilian_xyz", "path": "[...]" }' }
      ]
    }
  }
];
