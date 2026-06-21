import * as THREE from 'three';
import { gsap } from 'gsap';

// Main Page Background Configuration
export function initBackground() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 20;

  // Particle System Parameters
  const particleCount = 200;
  const areaSize = 35;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];

  for (let i = 0; i < particleCount * 3; i += 3) {
    // Distribute randomly in a box
    positions[i] = (Math.random() - 0.5) * areaSize;
    positions[i + 1] = (Math.random() - 0.5) * areaSize;
    positions[i + 2] = (Math.random() - 0.5) * areaSize;

    velocities.push({
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.02
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Particle material: standard circle texture generated dynamically
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 16;
  pCanvas.height = 16;
  const pCtx = pCanvas.getContext('2d');
  const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  grad.addColorStop(0.3, 'rgba(200, 200, 200, 0.4)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  pCtx.fillStyle = grad;
  pCtx.fillRect(0, 0, 16, 16);
  const pTexture = new THREE.CanvasTexture(pCanvas);

  const material = new THREE.PointsMaterial({
    size: 0.4,
    map: pTexture,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const starField = new THREE.Points(geometry, material);
  scene.scene = scene; // Reference fix if needed
  scene.add(starField);

  // Line connection logic setup
  const lineCount = 300;
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(lineCount * 2 * 3);
  const lineColors = new Float32Array(lineCount * 2 * 3);

  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    transparent: true,
    opacity: 0.15,
    vertexColors: true,
    blending: THREE.AdditiveBlending
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  // Mouse Interaction setup
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Scroll camera trigger linking
  let scrollPercent = 0;
  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    scrollPercent = window.scrollY / maxScroll;
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Smooth mouse coordinates
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Camera scrolling movement based on scroll percent
    camera.position.x = Math.sin(scrollPercent * Math.PI * 2) * 5 + mouse.x * 2;
    camera.position.y = -scrollPercent * 15 + mouse.y * 2;
    camera.position.z = 20 - scrollPercent * 8;
    camera.lookAt(0, -scrollPercent * 15, 0);

    // Update particles positions
    const posArr = geometry.attributes.position.array;
    let lineIdx = 0;

    // Convert mouse to 3D space to repel points
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;

      // Add velocity
      posArr[idx] += velocities[i].x;
      posArr[idx + 1] += velocities[i].y;
      posArr[idx + 2] += velocities[i].z;

      // Bounce off walls
      if (Math.abs(posArr[idx]) > areaSize / 2) velocities[i].x *= -1;
      if (Math.abs(posArr[idx + 1]) > areaSize / 2) velocities[i].y *= -1;
      if (Math.abs(posArr[idx + 2]) > areaSize / 2) velocities[i].z *= -1;

      // Mouse repulsion check
      const dx = posArr[idx] - intersectPoint.x;
      const dy = posArr[idx + 1] - intersectPoint.y;
      const dz = posArr[idx + 2] - intersectPoint.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 4) {
        const force = (4 - dist) * 0.04;
        posArr[idx] += (dx / dist) * force;
        posArr[idx + 1] += (dy / dist) * force;
        posArr[idx + 2] += (dz / dist) * force;
      }
    }
    geometry.attributes.position.needsUpdate = true;

    // Update Line Connections (simple distance threshold check)
    const linePos = lineGeometry.attributes.position.array;
    const lineCol = lineGeometry.attributes.color.array;

    for (let i = 0; i < particleCount && lineIdx < lineCount; i++) {
      const idxA = i * 3;
      const ax = posArr[idxA];
      const ay = posArr[idxA + 1];
      const az = posArr[idxA + 2];

      for (let j = i + 1; j < particleCount && lineIdx < lineCount; j++) {
        const idxB = j * 3;
        const bx = posArr[idxB];
        const by = posArr[idxB + 1];
        const bz = posArr[idxB + 2];

        const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2);
        if (dist < 5.5) {
          const lIdx = lineIdx * 6;

          linePos[lIdx] = ax;
          linePos[lIdx + 1] = ay;
          linePos[lIdx + 2] = az;

          linePos[lIdx + 3] = bx;
          linePos[lIdx + 4] = by;
          linePos[lIdx + 5] = bz;

          // Color fade based on distance — minimal white
          const alpha = 1 - dist / 5.5;

          // White to grey connection
          lineCol[lIdx] = 0.9 * alpha;     // White R
          lineCol[lIdx + 1] = 0.9 * alpha; // White G
          lineCol[lIdx + 2] = 0.9 * alpha; // White B

          lineCol[lIdx + 3] = 0.4 * alpha; // Grey R
          lineCol[lIdx + 4] = 0.4 * alpha; // Grey G
          lineCol[lIdx + 5] = 0.4 * alpha; // Grey B

          lineIdx++;
        }
      }
    }

    // Zero out unused lines
    for (let k = lineIdx; k < lineCount; k++) {
      const lIdx = k * 6;
      linePos[lIdx] = 0; linePos[lIdx + 1] = 0; linePos[lIdx + 2] = 0;
      linePos[lIdx + 3] = 0; linePos[lIdx + 4] = 0; linePos[lIdx + 5] = 0;
    }

    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.color.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();
}

// 3D Skill Tag Cloud Widget Configuration
export function initSkillCloud(containerId, onSkillSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 400;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 10;

  const skillsList = [
    { name: 'Python', desc: 'Data Analytics, scripting, model pipelines, and mathematical calculation.' },
    { name: 'SQL', desc: 'Relational databases, database design, query optimizations, and join structures.' },
    { name: 'Web Dev', desc: 'Creating semantic HTML5 structure and styling responsive interfaces with custom CSS.' },
    { name: 'Graphic Design', desc: 'Structuring visual content, wireframing dashboards, and editing media files.' },
    { name: 'Data Analysis', desc: 'Parsing logs, cleaning data, conducting EDA, and exporting data reports.' },
    { name: 'Excel', desc: 'Configuring cell sheets, applying calculations, and charting data points.' },
    { name: 'Google Workspace', desc: 'Collaboration tools and digital organization workflows.' },
    { name: 'Troubleshooting', desc: 'Local environment configuration, script debugging, and system diagnostic logs.' },
    { name: 'Online Teaching', desc: 'Delivering education sessions via MS Teams, Zoom, and Meet.' },
    { name: 'Digital Literacy', desc: 'Comprehensive internet research, prompt structure engineering, and security.' }
  ];

  const skillObjects = [];
  const radius = 3.5;
  const nodeCount = skillsList.length;

  // Distribute nodes evenly on sphere surface using Fibonacci Spiral
  for (let i = 0; i < nodeCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / nodeCount);
    const theta = Math.sqrt(nodeCount * Math.PI) * phi;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    // Group to hold sphere mesh and sprite label
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.userData = { skill: skillsList[i] };

    // Core Sphere node
    const sphereGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: i % 3 === 0 ? 0.9 : 0.5
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphereMesh);

    // Create Text Sprite Label
    const sprite = createTextSprite(skillsList[i].name, 'rgba(255,255,255,0.75)');
    sprite.position.y = 0.28; // Offset text above sphere
    group.add(sprite);

    // Dynamic thin line connecting to center of the scene
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08
    });
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z)];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);

    scene.add(group);
    skillObjects.push(group);
  }

  // Helper to generate text texture sprite
  function createTextSprite(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Transparent Background
    ctx.clearRect(0, 0, 256, 64);

    // Draw text with subtle glow
    ctx.font = '500 22px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Minimal white glow
    ctx.shadowColor = 'rgba(255,255,255,0.3)';
    ctx.shadowBlur = 4;

    ctx.fillStyle = color;
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.5, 0.375, 1);
    return sprite;
  }

  // Interactive mouse events
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let targetRotation = { x: 0, y: 0 };
  let currentRotation = { x: 0, y: 0 };
  let hoveredObject = null;

  // Rotation controls on Drag
  renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  renderer.domElement.addEventListener('mousemove', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

    if (isDragging) {
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      targetRotation.y += deltaX * 0.005;
      targetRotation.x += deltaY * 0.005;

      prevMousePos = { x: e.clientX, y: e.clientY };
    }
  });

  // Touch support for mobile viewports
  renderer.domElement.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  renderer.domElement.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;

      targetRotation.y += deltaX * 0.008;
      targetRotation.x += deltaY * 0.008;

      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  renderer.domElement.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Click Raycaster detection
  renderer.domElement.addEventListener('click', () => {
    if (isDragging) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Find first parent group containing userData
    for (let i = 0; i < intersects.length; i++) {
      let obj = intersects[i].object;
      while (obj && obj !== scene) {
        if (obj.userData && obj.userData.skill) {
          const skill = obj.userData.skill;
          
          // Trigger click bounce animation
          gsap.fromTo(obj.scale, 
            { x: 1, y: 1, z: 1 }, 
            { x: 1.4, y: 1.4, z: 1.4, duration: 0.15, yoyo: true, repeat: 1 }
          );

          if (onSkillSelect) {
            onSkillSelect(skill);
          }
          return;
        }
        obj = obj.parent;
      }
    }
  });

  // Resize listener
  const resizeObs = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
  });
  resizeObs.observe(container);

  // Animation Frame Loop
  function renderLoop() {
    requestAnimationFrame(renderLoop);

    // Apply rotation friction
    if (!isDragging) {
      targetRotation.y += 0.0015; // Slow ambient rotation
      targetRotation.x *= 0.95;
    }

    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;

    // Apply rotation values across all active nodes
    skillObjects.forEach((obj) => {
      // Get starting coords on sphere
      const skill = obj.userData.skill;
      const index = skillsList.indexOf(skill);
      const phi = Math.acos(-1 + (2 * index) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      // Rotate starting coordinates around Y and X axis
      let rx = radius * Math.sin(phi) * Math.cos(theta + currentRotation.y);
      let ry = radius * Math.sin(phi) * Math.sin(theta + currentRotation.y);
      let rz = radius * Math.cos(phi);

      // Rotate around X axis
      const tempY = ry * Math.cos(currentRotation.x) - rz * Math.sin(currentRotation.x);
      const tempZ = ry * Math.sin(currentRotation.x) + rz * Math.cos(currentRotation.x);

      obj.position.set(rx, tempY, tempZ);

      // Make labels always face the camera billboard-style
      const label = obj.children[1];
      if (label) {
        label.quaternion.copy(camera.quaternion);
      }
    });

    // Check Hover
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    let activeHover = null;
    for (let i = 0; i < intersects.length; i++) {
      let obj = intersects[i].object;
      while (obj && obj !== scene) {
        if (obj.userData && obj.userData.skill) {
          activeHover = obj;
          break;
        }
        obj = obj.parent;
      }
      if (activeHover) break;
    }

    if (activeHover) {
      if (hoveredObject !== activeHover) {
        if (hoveredObject) {
          // Scale down previous hovered
          gsap.to(hoveredObject.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
          hoveredObject.children[0].material.opacity = 0.8;
        }
        hoveredObject = activeHover;
        // Scale up hovered node
        gsap.to(hoveredObject.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.2 });
        hoveredObject.children[0].material.opacity = 1.0;
        
        // Show cursor pointer
        renderer.domElement.style.cursor = 'pointer';
      }
    } else if (hoveredObject) {
      // Reset state when mouse leaves
      gsap.to(hoveredObject.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
      hoveredObject.children[0].material.opacity = 0.8;
      hoveredObject = null;
      renderer.domElement.style.cursor = isDragging ? 'grabbing' : 'grab';
    }

    renderer.render(scene, camera);
  }

  renderLoop();
}
