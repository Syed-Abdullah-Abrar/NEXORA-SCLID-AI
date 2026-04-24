// NEXORA-SCLID-AI Web Demo
// Vanilla JS implementation per SOUL.md

const memoryBank = {
  current: new Map(),
  shortTerm: new Map(),
  longTerm: new Map(),
};

let eventLog = [];
let pipelineReady = false;

// Simulated pipeline classes matching src/ behavior
class SimulatedTaskPlanner {
  async generatePlan(query) {
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
}

class SimulatedAgent {
  constructor(id) { this.id = id; }
  async ingest(input) {
    return { id: `${this.id}-${Date.now()}`, source: this.id, data: input, timestamp: new Date().toISOString(), tags: [] };
  }
}

const planner = new SimulatedTaskPlanner();
const agents = {
  early_warning: new SimulatedAgent('early_warning'),
  situational_awareness: new SimulatedAgent('situational_awareness'),
  resource_allocation: new SimulatedAgent('resource_allocation'),
};

function log(message, type = 'system') {
  const entry = { time: new Date().toISOString(), message, type };
  eventLog.push(entry);
  renderEventLog();
}

function renderEventLog() {
  const logEl = document.getElementById('eventLog');
  logEl.innerHTML = eventLog.slice(-20).reverse().map(e =>
    `<div class="log-entry ${e.type}">[${new Date(e.time).toLocaleTimeString()}] ${e.message}</div>`
  ).join('');
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
      <div>${typeof a.data === 'object' ? JSON.stringify(a.data).substring(0, 80) : a.data}</div>
      <div class="tags">${a.tags?.join(', ') || ''}</div>
    </div>
  `).join('');
}

async function runPipeline() {
  const queryInput = document.getElementById('queryInput');
  const query = queryInput.value;

  log(`Starting pipeline: "${query}"`, 'system');

  const plan = await planner.generatePlan(query);
  log(`Generated ${plan.tasks.length} tasks`, 'system');

  // Update task graph visualization
  renderTaskGraph(plan.tasks);

  const outputs = {
    'ew-output': null,
    'sa-output': null,
    'ra-output': null,
  };

  // Early Warning Agent
  document.getElementById('ew-status').textContent = 'Processing...';
  await sleep(600);

  const ewData = {
    hazard: 'flood',
    severity: 'HIGH',
    confidence: 0.92,
    affectedArea: 'Zone A - Low lying residential',
    alertLevel: 'EVACUATE',
  };

  const ewArtifact = { id: `ew-${Date.now()}`, source: 'early_warning', data: ewData, timestamp: new Date().toISOString(), tags: ['early_warning', 'hazard', 'flood'] };
  memoryBank.current.set(ewArtifact.id, ewArtifact);

  document.getElementById('ew-output').textContent = JSON.stringify(ewData, null, 2);
  document.getElementById('ew-status').textContent = 'Complete';
  log(`Early Warning: ${ewData.hazard} detected - ${ewData.alertLevel}`, 'hazard');
  outputs['ew-output'] = ewData;

  // Situational Awareness Agent
  document.getElementById('sa-status').textContent = 'Processing...';
  await sleep(800);

  const saData = {
    unifiedPicture: `${ewData.severity} ${ewData.hazard} warning for ${ewData.affectedArea}. 12500 people in affected zone.`,
    riskLevel: 73,
    affectedPopulation: 12500,
    criticalInfrastructure: ['General Hospital', 'Elementary School'],
    shelterLocations: ['Community Center', 'High School'],
    recommendedActions: ['Evacuate flood-prone zones', 'Open shelters', 'Deploy sandbags'],
  };

  const saArtifact = { id: `sa-${Date.now()}`, source: 'situational_awareness', data: saData, timestamp: new Date().toISOString(), tags: ['situational', 'flood', 'geo-data'] };
  memoryBank.shortTerm.set(saArtifact.id, saArtifact);

  document.getElementById('sa-output').textContent = JSON.stringify(saData, null, 2);
  document.getElementById('sa-status').textContent = 'Complete';
  log(`Situational: ${saData.affectedPopulation} people affected, ${saData.recommendedActions.length} actions generated`, 'situational');
  outputs['sa-output'] = saData;

  // Resource Allocation Agent
  document.getElementById('ra-status').textContent = 'Processing...';
  await sleep(700);

  const raData = {
    plan: 'FLOOD_HIGH_' + Date.now().toString(36).toUpperCase(),
    personnelRequired: 45,
    actions: [
      { type: 'EVACUATE', target: 'Zone A', priority: 1, personnel: 20 },
      { type: 'SETUP_SHELTER', target: 'Community Center', priority: 2, personnel: 10 },
      { type: 'DISTRIBUTE_SUPPLIES', target: 'All shelters', priority: 3, personnel: 15 },
    ],
    supplyList: ['water', 'food', 'medical kits', 'sandbags', 'boats'],
    estimatedDuration: '6-12 hours',
  };

  const raArtifact = { id: `ra-${Date.now()}`, source: 'resource_allocation', data: raData, timestamp: new Date().toISOString(), tags: ['resource', 'allocation'] };
  memoryBank.longTerm.set(raArtifact.id, raArtifact);

  document.getElementById('ra-output').textContent = JSON.stringify(raData, null, 2);
  document.getElementById('ra-status').textContent = 'Complete';
  log(`Resource Allocation: Plan ${raData.plan} - ${raData.personnelRequired} personnel deployed`, 'resource');
  outputs['ra-output'] = raData;

  renderMemoryBank();
  log('Pipeline complete', 'system');
  pipelineReady = true;
}

function renderTaskGraph(tasks) {
  const graphEl = document.getElementById('taskGraph');
  if (!graphEl) return;

  graphEl.innerHTML = tasks.map((t, i) => {
    const deps = t.dependencies.length ? `← ${t.dependencies.join(', ')}` : '';
    return `<div class="task-node ${t.agentId}">Task ${i + 1}: ${t.agentId} ${deps}</div>`;
  }).join('');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  entry.textContent = hamOnline ? 'HAM Bridge connected - offline mode active' : 'HAM Bridge disconnected';
  hamLog.appendChild(entry);
}

async function simulateHAM() {
  const hamLog = document.getElementById('hamLog');
  const statusEl = document.getElementById('hamStatus');

  statusEl.className = 'ham-status online';
  hamOnline = true;

  const hamInput = {
    id: `ham-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: 'HAM_RADIO_KB1ABC',
    data: {
      type: 'APRS',
      callsign: 'KB1ABC',
      position: '4236.00N/07103.60W',
      message: 'Flooding at Main St and Route 9 - water rising rapidly',
      priority: 'critical',
    },
    tags: ['ham', 'aprs', 'field-report'],
  };

  memoryBank.current.set(hamInput.id, hamInput);

  const entry = document.createElement('div');
  entry.className = 'log-entry hazard';
  entry.textContent = `[HAM] ${hamInput.data.callsign}: ${hamInput.data.message}`;
  hamLog.appendChild(entry);

  renderMemoryBank();
  log(`HAM Input: ${hamInput.data.message}`, 'hazard');
}

async function sendHAMMessage() {
  if (!pipelineReady) {
    alert('Run pipeline first');
    return;
  }

  const hamLog = document.getElementById('hamLog');
  const raData = memoryBank.longTerm.values().next().value?.data;

  const entry = document.createElement('div');
  entry.className = 'log-entry resource';
  entry.textContent = `[HAM OUT] Resource plan ${raData?.plan || 'UNKNOWN'} broadcast - ${raData?.personnelRequired || '?'} personnel`;
  hamLog.appendChild(entry);
  log('Resource plan broadcast via HAM radio', 'resource');
}

// Init
toggleHAM();
renderMemoryBank();
log('NEXORA-SCLID-AI Demo initialized', 'system');
log('Type "Flood Response" and click Run Pipeline to start', 'system');