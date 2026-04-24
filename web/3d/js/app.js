// NEXORA 3D Digital Twin - Three.js Application

// State
let currentRole = 'commander';
let disasterTime = 0;
let fogRevealed = 0.34;
let scene, camera, renderer;
let waterMesh, cityGroup, fogGroup;
let animationId;

// Camera positions per role
const cameraConfigs = {
  commander: { position: new THREE.Vector3(0, 80, 60), lookAt: new THREE.Vector3(0, 0, 0), fov: 50 },
  marshal: { position: new THREE.Vector3(30, 25, 30), lookAt: new THREE.Vector3(0, 0, 0), fov: 60 },
  civilian: { position: new THREE.Vector3(-20, 3, 20), lookAt: new THREE.Vector3(10, 2, -10), fov: 75 }
};

// Pre-scripted disaster events
const disasterEvents = [
  { time: 0, type: 'warning', message: 'Flood Warning Issued', data: { waterLevel: 0.5 } },
  { time: 15, type: 'hazard', message: 'Water Level Rising', data: { waterLevel: 1.2 } },
  { time: 30, type: 'critical', message: 'Zone A Evacuation', data: { waterLevel: 2.1 } },
  { time: 45, type: 'ham', message: 'HAM Burst: Building Collapse', data: { waterLevel: 2.8 } },
  { time: 60, type: 'critical', message: 'Shelter Delta Activated', data: { waterLevel: 3.5 } },
  { time: 75, type: 'success', message: 'Route Clear to Shelter', data: { waterLevel: 4.2 } },
  { time: 90, type: 'success', message: 'All Units Evacuated', data: { waterLevel: 5.0 } }
];

// Initialize
function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0f);
  scene.fog = new THREE.FogExp2(0x0a0a0f, 0.008);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  // Cameras
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  updateCameraForRole();

  // Lights
  const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(50, 100, 50);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 300;
  dirLight.shadow.camera.left = -100;
  dirLight.shadow.camera.right = 100;
  dirLight.shadow.camera.top = 100;
  dirLight.shadow.camera.bottom = -100;
  scene.add(dirLight);

  const blueLight = new THREE.PointLight(0x3b82f6, 0.5, 100);
  blueLight.position.set(-30, 20, -30);
  scene.add(blueLight);

  const redLight = new THREE.PointLight(0xef4444, 0.3, 80);
  redLight.position.set(30, 10, 30);
  scene.add(redLight);

  // Ground plane
  const groundGeo = new THREE.PlaneGeometry(200, 200);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x12141d,
    roughness: 0.9,
    metalness: 0.1
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid overlay
  const gridHelper = new THREE.GridHelper(200, 40, 0x1e2433, 0x1e2433);
  scene.add(gridHelper);

  // Create city
  createCity();

  // Create water
  createWater();

  // Create fog of war elements (for Field Marshal)
  createFogOfWar();

  // Create building markers
  createMarkers();

  // Event listeners
  setupEventListeners();

  // Start animation loop
  animate();

  // Hide loading screen
  setTimeout(() => {
    document.getElementById('loading').classList.add('hidden');
  }, 2000);

  // Auto-advance timeline
  startDisasterSimulation();
}

function createCity() {
  cityGroup = new THREE.Group();

  // Building materials
  const buildingColors = [0x1a1d26, 0x1e222d, 0x232833, 0x282d3a];
  const windowColor = 0x3b82f6;

  // Generate city blocks
  for (let x = -80; x <= 80; x += 20) {
    for (let z = -80; z <= 80; z += 20) {
      // Skip center area for open space
      if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;

      // Random buildings per block
      const numBuildings = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < numBuildings; i++) {
        const width = 4 + Math.random() * 6;
        const depth = 4 + Math.random() * 6;
        const height = 8 + Math.random() * 25;

        const geo = new THREE.BoxGeometry(width, height, depth);
        const mat = new THREE.MeshStandardMaterial({
          color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
          roughness: 0.7,
          metalness: 0.3
        });

        const building = new THREE.Mesh(geo, mat);
        building.position.set(
          x + (Math.random() - 0.5) * 10,
          height / 2,
          z + (Math.random() - 0.5) * 10
        );
        building.castShadow = true;
        building.receiveShadow = true;

        // Add window glow
        const windowGeo = new THREE.PlaneGeometry(width * 0.8, height * 0.8);
        const windowMat = new THREE.MeshBasicMaterial({
          color: windowColor,
          transparent: true,
          opacity: 0.1 + Math.random() * 0.2,
          side: THREE.DoubleSide
        });
        const windowMesh = new THREE.Mesh(windowGeo, windowMat);
        windowMesh.position.y = 0;
        building.add(windowMesh);

        cityGroup.add(building);
      }
    }
  }

  scene.add(cityGroup);
}

function createWater() {
  const waterGeo = new THREE.PlaneGeometry(200, 200, 50, 50);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a5f,
    transparent: true,
    opacity: 0.8,
    roughness: 0.2,
    metalness: 0.8,
    side: THREE.DoubleSide
  });

  waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.y = 0;
  waterMesh.visible = false;
  scene.add(waterMesh);

  // Water glow
  const glowGeo = new THREE.PlaneGeometry(200, 200);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.rotation.x = -Math.PI / 2;
  glowMesh.position.y = 0.1;
  glowMesh.visible = false;
  scene.add(glowMesh);
  waterMesh.userData.glow = glowMesh;
}

function createFogOfWar() {
  fogGroup = new THREE.Group();

  // Create fog cubes that hide areas
  const fogGeo = new THREE.BoxGeometry(18, 15, 18);
  const fogMat = new THREE.MeshBasicMaterial({
    color: 0x0a0a0f,
    transparent: true,
    opacity: 0.95
  });

  for (let x = -70; x <= 70; x += 22) {
    for (let z = -70; z <= 70; z += 22) {
      const fog = new THREE.Mesh(fogGeo.clone(), fogMat.clone());
      fog.position.set(x, 7.5, z);
      fog.userData.revealed = false;
      fogGroup.add(fog);
    }
  }

  scene.add(fogGroup);
}

function createMarkers() {
  // Critical infrastructure markers
  const markerData = [
    { pos: [20, 0, 20], label: 'HOSPITAL', color: 0xef4444 },
    { pos: [-30, 0, 40], label: 'SHELTER A', color: 0x10b981 },
    { pos: [40, 0, -20], label: 'SHELTER B', color: 0x10b981 },
    { pos: [0, 0, -40], label: 'SHELTER C', color: 0x10b981 },
    { pos: [-20, 0, -30], label: 'SHELTER DELTA', color: 0x10b981 }
  ];

  markerData.forEach(m => {
    // Marker pole
    const poleGeo = new THREE.CylinderGeometry(0.3, 0.3, 4, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x6b7280 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(m.pos[0], 2, m.pos[2]);
    scene.add(pole);

    // Marker light
    const lightGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const lightMat = new THREE.MeshBasicMaterial({ color: m.color });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.set(m.pos[0], 4.5, m.pos[2]);
    scene.add(light);

    // Glow
    const glowGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: m.color,
      transparent: true,
      opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(m.pos[0], 4.5, m.pos[2]);
    scene.add(glow);
  });
}

function updateCameraForRole() {
  const config = cameraConfigs[currentRole];
  camera.position.copy(config.position);
  camera.lookAt(config.lookAt);
  camera.fov = config.fov;
  camera.updateProjectionMatrix();

  // Update fog density for marshal
  if (currentRole === 'marshal') {
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.02);
  } else {
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.008);
  }

  // Update UI visibility
  document.getElementById('info-card').style.display = currentRole === 'commander' ? 'block' : 'none';
  document.getElementById('agent-panel').style.display = currentRole === 'commander' ? 'block' : 'none';
  document.getElementById('fog-indicator').classList.toggle('visible', currentRole === 'marshal');
  document.getElementById('ar-overlay').classList.toggle('visible', currentRole === 'civilian');
}

function updateDisasterProgress(time) {
  disasterTime = Math.max(0, Math.min(100, time));

  // Update water
  const waterHeight = (disasterTime / 100) * 6;
  if (waterMesh) {
    waterMesh.visible = disasterTime > 5;
    waterMesh.position.y = waterHeight;
    if (waterMesh.userData.glow) {
      waterMesh.userData.glow.visible = disasterTime > 5;
      waterMesh.userData.glow.position.y = waterHeight + 0.1;
    }

    // Update water color based on severity
    const hue = 0.55 - (disasterTime / 100) * 0.1;
    waterMesh.material.color.setHSL(hue, 0.7, 0.3);
  }

  // Update UI
  document.getElementById('timeline-value').textContent = `${Math.round(disasterTime)}%`;
  document.getElementById('water-level').textContent = `${(waterHeight).toFixed(1)}m`;

  const riskLevel = disasterTime < 30 ? 'LOW' : disasterTime < 60 ? 'MODERATE' : disasterTime < 80 ? 'HIGH' : 'CRITICAL';
  const riskEl = document.getElementById('risk-level');
  riskEl.textContent = riskLevel;
  riskEl.className = 'info-value ' + (riskLevel === 'CRITICAL' ? 'critical' : riskLevel === 'HIGH' ? 'warning' : '');

  // Check events
  disasterEvents.forEach(event => {
    if (Math.abs(disasterTime - event.time) < 1) {
      triggerEvent(event);
    }
  });

  // Update fog of war for marshal
  if (currentRole === 'marshal' && fogGroup) {
    fogGroup.children.forEach((fog, i) => {
      // Reveal based on time and randomness
      if (disasterTime > 20 + i * 3) {
        fog.material.opacity = Math.max(0, fog.material.opacity - 0.02);
        if (fog.material.opacity < 0.5) {
          fog.visible = false;
        }
      }
    });
    document.getElementById('fog-coverage').textContent = Math.min(100, Math.round(34 + disasterTime * 0.6));
  }
}

function triggerEvent(event) {
  if (event.type === 'ham') {
    // Show HAM burst notification
    const burst = document.getElementById('ham-burst');
    burst.classList.add('visible');
    setTimeout(() => burst.classList.remove('visible'), 2000);

    // Reveal fog patches
    if (fogGroup) {
      const revealCount = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < revealCount && i < fogGroup.children.length; i++) {
        const fog = fogGroup.children[Math.floor(Math.random() * fogGroup.children.length)];
        if (fog.visible) {
          fog.material.opacity = 0.3;
        }
      }
    }
  }

  // Update agent status based on time
  const agentDots = document.querySelectorAll('.agent-dot');
  if (disasterTime > 60) {
    agentDots[0].className = 'agent-dot success';
    agentDots[0].parentElement.querySelector('.agent-status').textContent = 'COMPLETE';
  }
}

function startDisasterSimulation() {
  const slider = document.getElementById('timeline-slider');
  let playing = true;
  let speed = 0.3;

  function advance() {
    if (playing && disasterTime < 100) {
      updateDisasterProgress(disasterTime + speed);
      slider.value = disasterTime;
      requestAnimationFrame(advance);
    }
  }

  // Start automatically
  setTimeout(advance, 2500);

  // Pause on interaction
  slider.addEventListener('mousedown', () => playing = false);
  slider.addEventListener('mouseup', () => {
    playing = false;
    setTimeout(() => {
      playing = true;
      advance();
    }, 2000);
  });
}

function setupEventListeners() {
  // Role buttons
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRole = btn.dataset.role;
      updateCameraForRole();
    });
  });

  // Timeline slider
  document.getElementById('timeline-slider').addEventListener('input', (e) => {
    updateDisasterProgress(parseFloat(e.target.value));
  });

  // Window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function animate() {
  animationId = requestAnimationFrame(animate);

  // Gentle camera sway for commander
  if (currentRole === 'commander') {
    const time = Date.now() * 0.0005;
    camera.position.x = Math.sin(time) * 2;
    camera.position.z = 60 + Math.cos(time) * 2;
    camera.lookAt(0, 0, 0);
  }

  // Water animation
  if (waterMesh && waterMesh.visible) {
    const positions = waterMesh.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const wave = Math.sin(x * 0.1 + Date.now() * 0.002) * 0.3 +
                   Math.cos(z * 0.1 + Date.now() * 0.0015) * 0.2;
      positions.setZ(i, wave);
    }
    positions.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

// Start
init();
