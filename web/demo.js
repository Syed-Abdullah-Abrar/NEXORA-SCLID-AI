// NEXORA Omni-View Demo
// Multi-screen disaster response visualization

const memoryBank = {
  current: new Map(),
  shortTerm: new Map(),
  longTerm: new Map(),
};

let eventLog = [];
let pipelineReady = false;
let currentScreen = 1;

// Simulated pipeline classes
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

// Logging
function log(message, type = 'system') {
  const entry = { time: new Date().toISOString(), message, type };
  eventLog.push(entry);
  renderEventLog();
}

function renderEventLog() {
  const logEl = document.getElementById('eventLog');
  if (!logEl) return;
  logEl.innerHTML = eventLog.slice(-20).reverse().map(e =>
    `<div class="log-entry ${e.type}">[${new Date(e.time).toLocaleTimeString()}] ${e.message}</div>`
  ).join('');
  logEl.scrollTop = 0;
}

function renderMemoryBank() {
  const grid = document.getElementById('memoryGrid');
  if (!grid) return;

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

// Pipeline execution
async function runPipeline() {
  const queryInput = document.getElementById('queryInput');
  const query = queryInput?.value || 'Flood Response';

  log(`Starting pipeline: "${query}"`, 'system');

  const plan = await planner.generatePlan(query);
  log(`Generated ${plan.tasks.length} tasks`, 'system');
  renderTaskGraph(plan.tasks);

  const outputs = {
    'ew-output': null,
    'sa-output': null,
    'ra-output': null,
  };

  // Early Warning
  updateAgentStatus('ew-status', 'Processing...');
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

  updateAgentOutput('ew-output', ewData);
  updateAgentStatus('ew-status', 'Complete');
  log(`Early Warning: ${ewData.hazard} detected - ${ewData.alertLevel}`, 'hazard');
  outputs['ew-output'] = ewData;

  // Situational Awareness
  updateAgentStatus('sa-status', 'Processing...');
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

  updateAgentOutput('sa-output', saData);
  updateAgentStatus('sa-status', 'Complete');
  log(`Situational: ${saData.affectedPopulation} people affected`, 'situational');
  outputs['sa-output'] = saData;

  // Resource Allocation
  updateAgentStatus('ra-status', 'Processing...');
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

  updateAgentOutput('ra-output', raData);
  updateAgentStatus('ra-status', 'Complete');
  log(`Resource Allocation: Plan ${raData.plan} - ${raData.personnelRequired} personnel`, 'resource');
  outputs['ra-output'] = raData;

  renderMemoryBank();
  log('Pipeline complete', 'system');
  pipelineReady = true;
}

function updateAgentStatus(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function updateAgentOutput(id, data) {
  const el = document.getElementById(id);
  if (el) el.textContent = JSON.stringify(data, null, 2);
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
  if (statusEl) {
    statusEl.className = 'ham-status' + (hamOnline ? ' online' : '');
  }
}

async function simulateHAM() {
  const hamLog = document.getElementById('hamLog');
  const statusEl = document.getElementById('hamStatus');

  if (statusEl) statusEl.className = 'ham-status online';
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

  if (hamLog) {
    const entry = document.createElement('div');
    entry.className = 'log-entry hazard';
    entry.textContent = `[HAM] ${hamInput.data.callsign}: ${hamInput.data.message}`;
    hamLog.appendChild(entry);
  }

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

  if (hamLog) {
    const entry = document.createElement('div');
    entry.className = 'log-entry resource';
    entry.textContent = `[HAM OUT] Resource plan ${raData?.plan || 'UNKNOWN'} broadcast - ${raData?.personnelRequired || '?'} personnel`;
    hamLog.appendChild(entry);
  }
  log('Resource plan broadcast via HAM radio', 'resource');
}

// Screen navigation (called from HTML)
function showScreen(n) {
  currentScreen = n;
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const target = document.getElementById(`screen-${n}`);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.screen-nav-btn').forEach(btn => {
    if (btn.dataset.screen == n) {
      btn.classList.add('bg-nexora-agent', 'text-white');
      btn.classList.remove('text-nexora-muted', 'hover:bg-nexora-surface');
    } else {
      btn.classList.remove('bg-nexora-agent', 'text-white');
      btn.classList.add('text-nexora-muted', 'hover:bg-nexora-surface');
    }
  });
}

// Push to Talk simulation for Dark Mode screen
function pushToTalk() {
  log('Push-to-talk activated - voice captured', 'system');
  // Simulate voice synthesis
  setTimeout(() => {
    log('VoiceSynth: Broadcasting alert to UEB', 'system');
  }, 500);
}

// Init
function init() {
  // Try init functions that exist
  if (document.getElementById('hamStatus')) toggleHAM();
  if (document.getElementById('memoryGrid')) renderMemoryBank();
  log('NEXORA Omni-View Demo initialized', 'system');
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SimulatedTaskPlanner, SimulatedAgent, memoryBank, log, showScreen, pushToTalk };
}
