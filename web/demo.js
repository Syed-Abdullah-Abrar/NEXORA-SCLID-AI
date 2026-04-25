// NEXORA Omni-View Demo - Pre-Scripted Data Story
// Refactored for hackathon pitch control

import { THE_STORY } from './story.js';

let currentFrame = 0;
let eventLog = [];

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

// Core render function - updates entire UI from story frame
function renderFrame(frameIndex) {
  if (frameIndex < 0 || frameIndex >= THE_STORY.length) {
    console.warn('Frame index out of bounds');
    return;
  }

  const frame = THE_STORY[frameIndex];
  currentFrame = frameIndex;

  // Stop any auto-advance from app.js - we're in story mode now
  if (window.Nexora3D && window.Nexora3D.stopAutoAdvance) {
    window.Nexora3D.stopAutoAdvance();
  }

  // Log the presenter script
  if (frame.presenter_script) {
    eventLog = [];
    log(frame.presenter_script, 'system');
  }

  // Update 3D state
  if (window.Nexora3D) {
    window.Nexora3D.updateDisasterProgress(frame.timeline_progress || 0);
    window.Nexora3D.setRole(frame.camera_role || 'commander');
  }

  // Update camera role buttons
  document.querySelectorAll('.role-btn').forEach(btn => {
    if (btn.dataset.role === frame.camera_role) {
      btn.classList.add('bg-nexora-agent', 'text-white');
      btn.classList.remove('bg-nexora-surface', 'text-nexora-muted');
    } else {
      btn.classList.remove('bg-nexora-agent', 'text-white');
      btn.classList.add('bg-nexora-surface', 'text-nexora-muted');
    }
  });

  // Update timeline
  const timelineValue = document.getElementById('timeline-value');
  if (timelineValue) timelineValue.textContent = (frame.timeline_progress || 0) + '%';
  const timelineSlider = document.getElementById('timeline-slider');
  if (timelineSlider) timelineSlider.value = frame.timeline_progress || 0;

  // Update risk level and water level
  const riskLevel = document.getElementById('risk-level');
  if (riskLevel) {
    riskLevel.textContent = frame.risk_level || 'LOW';
    riskLevel.className = 'font-bold ' +
      (frame.risk_level === 'CRITICAL' ? 'text-nexora-critical' :
       frame.risk_level === 'HIGH' ? 'text-nexora-warning' :
       frame.risk_level === 'MODERATE' ? 'text-nexora-warning' : '');
  }

  const riskIndicator = document.getElementById('risk-indicator');
  if (riskIndicator) riskIndicator.textContent = frame.risk_indicator || 'FLOOD RISK: LOW';

  const waterLevel = document.getElementById('water-level');
  if (waterLevel) waterLevel.textContent = frame.water_level || '0.0m';

  // Update agent status
  updateAgentStatus('ew-status', frame.agent_status?.early_warning || 'STANDBY');
  updateAgentStatus('sa-status', frame.agent_status?.situational || 'STANDBY');
  updateAgentStatus('ra-status', frame.agent_status?.resource || 'STANDBY');

  // Update screen
  if (typeof frame.screen === 'number') {
    showScreen(frame.screen);
  }

  // Update HAM terminal log
  const hamTerminal = document.getElementById('ham-terminal-log');
  if (hamTerminal && frame.ham_terminal_log) {
    hamTerminal.innerHTML = frame.ham_terminal_log.split('\n').map(line =>
      `<div class="text-sm text-nexora-text/80">${line}</div>`
    ).join('');
  } else if (hamTerminal) {
    hamTerminal.innerHTML = '<div class="text-nexora-muted">AWAITING TRANSMISSION...</div>';
  }

  // Update presenter script display
  const presenterScript = document.getElementById('presenter-script');
  if (presenterScript) {
    presenterScript.textContent = frame.presenter_script || '';
  }

  // Update frame counter
  const frameCounter = document.getElementById('frame-counter');
  if (frameCounter) {
    frameCounter.textContent = `${frameIndex + 1} / ${THE_STORY.length}`;
  }

  // Update next/prev button states
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  if (prevBtn) prevBtn.disabled = frameIndex === 0;
  if (nextBtn) nextBtn.disabled = frameIndex === THE_STORY.length - 1;
}

function updateAgentStatus(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Navigation functions
function nextFrame() {
  if (currentFrame < THE_STORY.length - 1) {
    renderFrame(currentFrame + 1);
  }
}

function prevFrame() {
  if (currentFrame > 0) {
    renderFrame(currentFrame - 1);
  }
}

function goToFrame(frameIndex) {
  renderFrame(frameIndex);
}

// Screen navigation (called from HTML)
function showScreen(n) {
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

// HAM simulation
async function simulateHAM() {
  log('HAM Input: APRS packet received from KB1ABC', 'hazard');
}

async function sendHAMMessage() {
  log('Resource plan broadcast via HAM radio', 'resource');
}

// Push to Talk for dark mode screen
function pushToTalk() {
  log('Push-to-talk activated - voice broadcast', 'system');
}

// Scenario triggers (kept for backward compat but disabled in story mode)
function triggerScenario(type) {
  log(`Scenario trigger: ${type}`, 'system');
}

// Init - start at frame 0
function init() {
  renderFrame(0);
  log('NEXORA Omni-View Demo initialized - Story Mode', 'system');
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderFrame, nextFrame, prevFrame, goToFrame, showScreen, currentFrame: () => currentFrame };
}
