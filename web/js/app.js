// NEXORA 3D Digital Twin - Optimized Three.js Application
// GPU-based water shader + delta time animation

let scene, camera, renderer, waterMesh, cityGroup;
let currentRole = 'commander';
let disasterTime = 0;
let clock, animationId;

// Camera positions per role
const cameraConfigs = {
  commander: { position: [0, 80, 60], lookAt: [0, 0, 0], fov: 50 },
  marshal: { position: [30, 25, 30], lookAt: [0, 0, 0], fov: 60 },
  civilian: { position: [-20, 3, 20], lookAt: [10, 2, -10], fov: 75 }
};

// Water shader - GPU-based wave animation
const waterVertexShader = `
  uniform float uTime;
  uniform float uWaterLevel;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Only animate vertices above water level
    if (pos.y < uWaterLevel + 2.0) {
      float wave1 = sin(pos.x * 0.3 + uTime * 1.5) * 0.3;
      float wave2 = cos(pos.z * 0.2 + uTime * 1.2) * 0.2;
      float wave3 = sin((pos.x + pos.z) * 0.15 + uTime * 0.8) * 0.15;
      pos.y += wave1 + wave2 + wave3;
      vElevation = (wave1 + wave2 + wave3 + 0.5) / 1.0;
    } else {
      vElevation = 0.0;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const waterFragmentShader = `
  uniform float uWaterLevel;
  uniform float uDisasterTime;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    // Color shifts from blue to red as disaster progresses
    float t = uDisasterTime / 100.0;
    vec3 waterColor = mix(
      vec3(0.12, 0.23, 0.45),  // Safe blue
      vec3(0.45, 0.15, 0.15),  // Danger red
      t
    );

    // Elevation-based brightness
    float brightness = 0.7 + vElevation * 0.5;
    waterColor *= brightness;

    // Foam at peaks
    if (vElevation > 0.6) {
      waterColor = mix(waterColor, vec3(0.8, 0.9, 1.0), (vElevation - 0.6) * 2.0);
    }

    gl_FragColor = vec4(waterColor, 0.85);
  }
`;

function init() {
  clock = new THREE.Clock();

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

  const container = document.getElementById('webgl-container');
  if (container) {
    container.appendChild(renderer.domElement);
  }

  // Camera
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

  // Ground
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

  // Grid
  const gridHelper = new THREE.GridHelper(200, 40, 0x1e2433, 0x1e2433);
  scene.add(gridHelper);

  createCity();
  createWater();
  createMarkers();

  setupEventListeners();
  animate();

  // Hide loading
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('hidden');
  }, 1500);
}

function createCity() {
  cityGroup = new THREE.Group();
  const buildingColors = [0x1a1d26, 0x1e222d, 0x232833, 0x282d3a];

  for (let x = -80; x <= 80; x += 20) {
    for (let z = -80; z <= 80; z += 20) {
      if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;

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
        cityGroup.add(building);
      }
    }
  }

  scene.add(cityGroup);
}

function createWater() {
  const waterGeo = new THREE.PlaneGeometry(200, 200, 64, 64);

  waterMesh = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uWaterLevel: { value: 0 },
      uDisasterTime: { value: 0 }
    },
    transparent: true,
    side: THREE.DoubleSide
  });

  const water = new THREE.Mesh(waterGeo, waterMesh);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0;
  water.visible = false;
  scene.add(water);
  waterMesh = water;
}

function createMarkers() {
  const markerData = [
    { pos: [20, 0, 20], label: 'HOSPITAL', color: 0xef4444 },
    { pos: [-30, 0, 40], label: 'SHELTER A', color: 0x10b981 },
    { pos: [40, 0, -20], label: 'SHELTER B', color: 0x10b981 },
    { pos: [0, 0, -40], label: 'SHELTER C', color: 0x10b981 },
    { pos: [-20, 0, -30], label: 'SHELTER DELTA', color: 0x10b981 }
  ];

  markerData.forEach(m => {
    const poleGeo = new THREE.CylinderGeometry(0.3, 0.3, 4, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x6b7280 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(m.pos[0], 2, m.pos[2]);
    scene.add(pole);

    const lightGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const lightMat = new THREE.MeshBasicMaterial({ color: m.color });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.set(m.pos[0], 4.5, m.pos[2]);
    scene.add(light);

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
  if (!config) return;

  camera.position.set(...config.position);
  camera.lookAt(...config.lookAt);
  camera.fov = config.fov;
  camera.updateProjectionMatrix();

  // Adjust fog for marshal
  if (currentRole === 'marshal') {
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.02);
  } else {
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.008);
  }
}

function updateDisasterProgress(time) {
  disasterTime = Math.max(0, Math.min(100, time));

  if (waterMesh) {
    waterMesh.visible = disasterTime > 5;
    waterMesh.position.y = (disasterTime / 100) * 6;
    waterMesh.material.uniforms.uWaterLevel.value = waterMesh.position.y;
    waterMesh.material.uniforms.uDisasterTime.value = disasterTime;
  }

  // Update UI
  const timelineValue = document.getElementById('timeline-value');
  if (timelineValue) timelineValue.textContent = `${Math.round(disasterTime)}%`;

  const waterLevel = document.getElementById('water-level');
  if (waterLevel) waterLevel.textContent = `${((disasterTime / 100) * 6).toFixed(1)}m`;

  const riskLevel = document.getElementById('risk-level');
  if (riskLevel) {
    const level = disasterTime < 30 ? 'LOW' : disasterTime < 60 ? 'MODERATE' : disasterTime < 80 ? 'HIGH' : 'CRITICAL';
    riskLevel.textContent = level;
    riskLevel.className = 'info-value ' + (level === 'CRITICAL' ? 'critical' : level === 'HIGH' ? 'warning' : '');
  }

  const timelineSlider = document.getElementById('timeline-slider');
  if (timelineSlider) timelineSlider.value = disasterTime;
}

function setupEventListeners() {
  // Role buttons - use event delegation
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('role-btn')) {
      const role = e.target.dataset.role;
      if (role && cameraConfigs[role]) {
        document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentRole = role;
        updateCameraForRole();
      }
    }
  });

  // Timeline slider
  const slider = document.getElementById('timeline-slider');
  if (slider) {
    slider.addEventListener('input', (e) => {
      updateDisasterProgress(parseFloat(e.target.value));
    });
  }

  // Window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Listen for external events
  window.addEventListener('nexora:timeline', (e) => {
    updateDisasterProgress(e.detail.time);
  });

  window.addEventListener('nexora:role', (e) => {
    currentRole = e.detail.role;
    updateCameraForRole();
  });
}

function animate() {
  animationId = requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Update water shader time
  if (waterMesh && waterMesh.material.uniforms) {
    waterMesh.material.uniforms.uTime.value = elapsed;
  }

  // Gentle camera sway for commander
  if (currentRole === 'commander') {
    camera.position.x = Math.sin(elapsed * 0.5) * 2;
    camera.position.z = 60 + Math.cos(elapsed * 0.5) * 2;
    camera.lookAt(0, 0, 0);
  }

  renderer.render(scene, camera);
}

// Auto-advance timeline
let autoAdvanceTimer;
function startAutoAdvance() {
  if (autoAdvanceTimer) clearInterval(autoAdvanceTimer);
  autoAdvanceTimer = setInterval(() => {
    if (disasterTime < 100) {
      updateDisasterProgress(disasterTime + 0.3);
    }
  }, 50);
}

// Start
init();
startAutoAdvance();

// Export for external control
window.Nexora3D = {
  updateDisasterProgress,
  updateCameraForRole,
  setRole: (role) => {
    currentRole = role;
    updateCameraForRole();
  },
  getDisasterTime: () => disasterTime,
  startAutoAdvance,
  stopAutoAdvance: () => clearInterval(autoAdvanceTimer)
};
