// NEXORA-SCLID-AI Web Demo
// Vanilla JS implementation per SOUL.md

const memoryBank = {
  current: new Map(),
  shortTerm: new Map(),
  longTerm: new Map(),
};

let eventLog = [];

function log(message, type = 'system') {
  const entry = { time: new Date().toISOString(), message, type };
  eventLog.push(entry);
  renderEventLog();
}

function renderEventLog() {
  const logEl = document.getElementById('eventLog');
  logEl.innerHTML = eventLog.map(e =>
    `<div class="log-entry ${e.type}">[${new Date(e.time).toLocaleTimeString()}] ${e.message}</div>`
  ).reverse().join('');
  logEl.scrollTop = 0;
}

function renderMemoryBank() {
  const grid = document.getElementById('memoryGrid');
  const allArtifacts = [
    ...Array.from(memoryBank.current.values()),
    ...Array.from(memoryBank.shortTerm.values()),
    ...Array.from(memoryBank.longTerm.values()),
  ];

  if (allArtifacts.length === 0) {
    grid.innerHTML = '<div class="memory-card">No artifacts stored</div>';
    return;
  }

  grid.innerHTML = allArtifacts.map(a => `
    <div class="memory-card">
      <div class="source">${a.source}</div>
      <div>${JSON.stringify(a.data)}</div>
      <div class="tags">${a.tags.join(', ')}</div>
    </div>
  `).join('');
}

async function generatePlan(query) {
  // Simulate TaskPlanner behavior from src/orchestrator/TaskPlanner.ts
  const normalizedQuery = query.toLowerCase();
  if (normalizedQuery.includes('flood') || normalizedQuery.includes('warning')) {
    return {
      tasks: [
        { id: 'ew_1', agentId: 'early_warning', dependencies: [], input: { hazard: 'flood' } },
        { id: 'sa_1', agentId: 'situational_awareness', dependencies: ['ew_1'], input: {} },
        { id: 'ra_1', agentId: 'resource_allocation', dependencies: ['ew_1', 'sa_1'], input: {} },
      ],
    };
  }
  return { tasks: [] };
}

function simulateAgent(agentId, input, callback) {
  return new Promise(resolve => {
    const statusEl = document.getElementById(`${agentId.replace('_', '-')}-status`);
    statusEl.textContent = 'Processing...';

    setTimeout(() => {
      const output = callback(input);
      statusEl.textContent = 'Complete';
      resolve(output);
    }, 800 + Math.random() * 400);
  });
}

async function runPipeline() {
  const queryInput = document.getElementById('queryInput');
  const query = queryInput.value;

  log(`Starting pipeline: "${query}"`, 'system');

  const plan = await generatePlan(query);
  log(`Generated ${plan.tasks.length} tasks`, 'system');

  const ewOutput = document.getElementById('ew-output');
  const saOutput = document.getElementById('sa-output');
  const raOutput = document.getElementById('ra-output');

  // Early Warning Agent
  const ewArtifact = {
    id: `ew-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: 'early_warning',
    data: {
      hazard: 'flood',
      severity: 'HIGH',
      affectedArea: 'Zone A - Low lying residential area',
      confidence: 0.92,
      alertLevel: 'EVACUATE',
    },
    tags: ['early_warning', 'flood', 'zone-a', 'evacuate'],
  };

  await simulateAgent('early_warning', { query }, () => {
    memoryBank.current.set(ewArtifact.id, ewArtifact);
    ewOutput.textContent = JSON.stringify(ewArtifact.data, null, 2);
    log(`Early Warning: ${ewArtifact.data.hazard} detected - ${ewArtifact.data.alertLevel}`, 'hazard');
    return ewArtifact;
  });

  // Situational Awareness Agent
  const saArtifact = {
    id: `sa-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: 'situational_awareness',
    data: {
      location: '42.36°N, 71.06°W',
      affectedPopulation: 12500,
      sheltersAvailable: 3,
      shelterCapacity: 850,
      roadBlocks: ['Route 9', 'Main St Bridge'],
      weatherConditions: 'Heavy rain continuing, 2-3 inches expected',
    },
    tags: ['situational', 'flood', 'geo-data'],
  };

  await simulateAgent('situational', { hazardData: ewArtifact.data }, () => {
    memoryBank.shortTerm.set(saArtifact.id, saArtifact);
    saOutput.textContent = JSON.stringify(saArtifact.data, null, 2);
    log(`Situational: ${saArtifact.data.affectedPopulation} people affected, ${saArtifact.data.sheltersAvailable} shelters open`, 'situational');
    return saArtifact;
  });

  // Resource Allocation Agent
  const raArtifact = {
    id: `ra-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: 'resource_allocation',
    data: {
      plan: 'EVACUATE_ZONE_A',
      actions: [
        { type: 'EVACUATE', area: 'Zone A', priority: 1, personnel: 45 },
        { type: 'SETUP_SHELTER', location: 'Community Center', capacity: 300 },
        { type: 'ROUTE_BLOCK', road: 'Route 9', alternative: 'I-495 detour' },
        { type: 'SUPPLY_DROP', location: 'Emergency staging', supplies: ['water', 'food', 'medical'] },
      ],
      estimatedCompletion: '4-6 hours',
    },
    tags: ['resource', 'allocation', 'plan'],
  };

  await simulateAgent('resource', { situationalData: saArtifact.data }, () => {
    memoryBank.longTerm.set(raArtifact.id, raArtifact);
    raOutput.textContent = JSON.stringify(raArtifact.data, null, 2);
    log(`Resource Allocation: Plan ${raArtifact.data.plan} - ${raArtifact.data.actions.length} actions`, 'resource');
    return raArtifact;
  });

  renderMemoryBank();
  log('Pipeline complete', 'system');
}

// HAM Bridge simulation
let hamOnline = false;

function toggleHAM() {
  hamOnline = !hamOnline;
  const statusEl = document.getElementById('hamStatus');
  statusEl.className = 'ham-status' + (hamOnline ? ' online' : '');
  const hamLog = document.getElementById('hamLog');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = hamOnline ? 'HAM Bridge connected - awaiting transmission' : 'HAM Bridge disconnected';
  hamLog.appendChild(entry);
}

async function simulateHAM() {
  const hamLog = document.getElementById('hamLog');
  const statusEl = document.getElementById('hamStatus');

  statusEl.className = 'ham-status online';

  const hamInput = {
    id: `ham-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: 'HAM_RADIO_KB1ABC',
    data: {
      type: 'APRS',
      callsign: 'KB1ABC',
      position: '4236.00N/07103.60W',
      message: 'Flooding reported at Main St and Route 9 intersection - water rising',
      priority: 'high',
    },
    tags: ['ham', 'aprs', 'field-report'],
  };

  const entry = document.createElement('div');
  entry.className = 'log-entry hazard';
  entry.textContent = `[HAM] ${hamInput.data.callsign}: ${hamInput.data.message}`;
  hamLog.appendChild(entry);

  memoryBank.current.set(hamInput.id, hamInput);
  renderMemoryBank();
  log(`HAM Input: ${hamInput.data.message}`, 'hazard');

  const response = {
    id: `ham-resp-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: 'RESOURCE_ALLOCATION',
    data: {
      type: 'ACK',
      message: 'KB1ABC - Roger your report. Evacuation team en route. Standby.',
    },
    tags: ['ham', 'response'],
  };

  setTimeout(() => {
    const ackEntry = document.createElement('div');
    ackEntry.className = 'log-entry resource';
    ackEntry.textContent = `[HAM OUT] ${response.data.message}`;
    hamLog.appendChild(ackEntry);
  }, 1500);
}

function sendHAMMessage() {
  const hamLog = document.getElementById('hamLog');
  const entry = document.createElement('div');
  entry.className = 'log-entry resource';
  entry.textContent = `[HAM OUT] Resource plan broadcast: EVACUATE_ZONE_A - 45 personnel deployed`;
  hamLog.appendChild(entry);
  log('Resource plan broadcast via HAM', 'resource');
}

// Init
toggleHAM();
renderMemoryBank();
log('Web demo initialized', 'system');