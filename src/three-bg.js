import * as THREE from 'three';
import { gsap } from 'gsap';

// Main Page Background & Professional 3D Scene Configuration
export function initBackground() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
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
  camera.position.z = 22;

  // Soft Studio Lighting Palette
  const ambientLight = new THREE.AmbientLight(0xf8fafc, 0.7);
  scene.add(ambientLight);

  // Soft Ice Cyan Point Light
  const pointLight1 = new THREE.PointLight(0x38bdf8, 2.0, 50);
  pointLight1.position.set(14, 12, 10);
  scene.add(pointLight1);

  // Deep Slate Indigo Point Light
  const pointLight2 = new THREE.PointLight(0x818cf8, 1.8, 50);
  pointLight2.position.set(-14, -12, 8);
  scene.add(pointLight2);

  // 1. ELEGANT FLOATING 3D GEOMETRIES
  const floatingObjectsGroup = new THREE.Group();
  scene.add(floatingObjectsGroup);

  // Object A: Torus Knot Centerpiece (Slate Silver & Ice Blue)
  const torusKnotGeo = new THREE.TorusKnotGeometry(2.2, 0.45, 128, 32);
  const torusKnotMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    wireframe: true,
    emissive: 0x0f172a,
    roughness: 0.3,
    metalness: 0.85,
    transparent: true,
    opacity: 0.75
  });
  const torusKnot = new THREE.Mesh(torusKnotGeo, torusKnotMat);
  torusKnot.position.set(8, 2, -2);
  floatingObjectsGroup.add(torusKnot);

  // Subtle Metallic Ring
  const ringGeo = new THREE.RingGeometry(3.4, 3.48, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.25
  });
  const cyberRing1 = new THREE.Mesh(ringGeo, ringMat);
  cyberRing1.position.copy(torusKnot.position);
  cyberRing1.rotation.x = Math.PI / 3;
  floatingObjectsGroup.add(cyberRing1);

  // Object B: Refined Icosahedron (Indigo Accent)
  const icoGeo = new THREE.IcosahedronGeometry(1.6, 1);
  const icoMat = new THREE.MeshStandardMaterial({
    color: 0x818cf8,
    wireframe: true,
    emissive: 0x1e1b4b,
    roughness: 0.2,
    metalness: 0.9,
    transparent: true,
    opacity: 0.7
  });
  const icoMesh = new THREE.Mesh(icoGeo, icoMat);
  icoMesh.position.set(-9, 5, -4);
  floatingObjectsGroup.add(icoMesh);

  // Inner Core Sphere
  const coreGeo = new THREE.SphereGeometry(0.65, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.5
  });
  const coreSphere = new THREE.Mesh(coreGeo, coreMat);
  coreSphere.position.copy(icoMesh.position);
  floatingObjectsGroup.add(coreSphere);

  // Object C: Subtle Octahedron
  const octaGeo = new THREE.OctahedronGeometry(1.4, 0);
  const octaMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    wireframe: true,
    metalness: 0.8,
    transparent: true,
    opacity: 0.65
  });
  const octaMesh = new THREE.Mesh(octaGeo, octaMat);
  octaMesh.position.set(9, -7, -3);
  floatingObjectsGroup.add(octaMesh);

  const interactive3DMeshes = [torusKnot, icoMesh, octaMesh];

  // 2. AMBIENT PARTICLE CONSTELLATION NETWORK
  const particleCount = 220;
  const areaSize = 40;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * areaSize;
    positions[i + 1] = (Math.random() - 0.5) * areaSize;
    positions[i + 2] = (Math.random() - 0.5) * areaSize;

    velocities.push({
      x: (Math.random() - 0.5) * 0.018,
      y: (Math.random() - 0.5) * 0.018,
      z: (Math.random() - 0.5) * 0.018
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Glow texture for particles (Slate Ice)
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 32;
  pCanvas.height = 32;
  const pCtx = pCanvas.getContext('2d');
  const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.4)');
  grad.addColorStop(0.8, 'rgba(129, 140, 248, 0.1)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  pCtx.fillStyle = grad;
  pCtx.fillRect(0, 0, 32, 32);
  const pTexture = new THREE.CanvasTexture(pCanvas);

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.45,
    map: pTexture,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const starField = new THREE.Points(geometry, particleMaterial);
  scene.add(starField);

  // Line Connections
  const lineMaxCount = 260;
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(lineMaxCount * 2 * 3);
  const lineColors = new Float32Array(lineMaxCount * 2 * 3);

  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    transparent: true,
    opacity: 0.18,
    vertexColors: true,
    blending: THREE.AdditiveBlending
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  // Mouse Interaction Setup
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  let hoveredMesh = null;

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('click', () => {
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    const intersects = raycaster.intersectObjects(interactive3DMeshes);
    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      gsap.fromTo(clickedMesh.scale,
        { x: 1, y: 1, z: 1 },
        { x: 1.35, y: 1.35, z: 1.35, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out' }
      );
    }
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let scrollPercent = 0;
  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    scrollPercent = window.scrollY / maxScroll;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;

    torusKnot.rotation.x = time * 0.15;
    torusKnot.rotation.y = time * 0.2;

    cyberRing1.rotation.z = -time * 0.1;
    cyberRing1.rotation.y = time * 0.08;

    icoMesh.rotation.x = -time * 0.12;
    icoMesh.rotation.y = time * 0.18;
    coreSphere.position.copy(icoMesh.position);

    octaMesh.rotation.x = time * 0.25;
    octaMesh.rotation.z = time * 0.15;

    torusKnot.position.y = 2 + Math.sin(time * 1.2) * 0.35;
    icoMesh.position.y = 5 + Math.cos(time * 1.0) * 0.4;
    octaMesh.position.y = -7 + Math.sin(time * 1.4) * 0.35;

    camera.position.x = Math.sin(scrollPercent * Math.PI * 2) * 4.5 + mouse.x * 2.0;
    camera.position.y = -scrollPercent * 16 + mouse.y * 2.0;
    camera.position.z = 22 - scrollPercent * 7;
    camera.lookAt(0, -scrollPercent * 16, 0);

    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    const intersects = raycaster.intersectObjects(interactive3DMeshes);
    if (intersects.length > 0) {
      document.body.style.cursor = 'pointer';
      const mesh = intersects[0].object;
      if (hoveredMesh !== mesh) {
        hoveredMesh = mesh;
        gsap.to(mesh.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.25 });
      }
    } else {
      if (hoveredMesh) {
        gsap.to(hoveredMesh.scale, { x: 1, y: 1, z: 1, duration: 0.25 });
        hoveredMesh = null;
      }
      document.body.style.cursor = 'default';
    }

    const posArr = geometry.attributes.position.array;
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;

      posArr[idx] += velocities[i].x;
      posArr[idx + 1] += velocities[i].y;
      posArr[idx + 2] += velocities[i].z;

      if (Math.abs(posArr[idx]) > areaSize / 2) velocities[i].x *= -1;
      if (Math.abs(posArr[idx + 1]) > areaSize / 2) velocities[i].y *= -1;
      if (Math.abs(posArr[idx + 2]) > areaSize / 2) velocities[i].z *= -1;

      const dx = posArr[idx] - intersectPoint.x;
      const dy = posArr[idx + 1] - intersectPoint.y;
      const dz = posArr[idx + 2] - intersectPoint.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 4.0) {
        const force = (4.0 - dist) * 0.035;
        posArr[idx] += (dx / dist) * force;
        posArr[idx + 1] += (dy / dist) * force;
        posArr[idx + 2] += (dz / dist) * force;
      }
    }
    geometry.attributes.position.needsUpdate = true;

    const linePos = lineGeometry.attributes.position.array;
    const lineCol = lineGeometry.attributes.color.array;
    let lineIdx = 0;

    for (let i = 0; i < particleCount && lineIdx < lineMaxCount; i++) {
      const idxA = i * 3;
      const ax = posArr[idxA];
      const ay = posArr[idxA + 1];
      const az = posArr[idxA + 2];

      for (let j = i + 1; j < particleCount && lineIdx < lineMaxCount; j++) {
        const idxB = j * 3;
        const bx = posArr[idxB];
        const by = posArr[idxB + 1];
        const bz = posArr[idxB + 2];

        const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2);
        if (dist < 5.0) {
          const lIdx = lineIdx * 6;

          linePos[lIdx] = ax; linePos[lIdx + 1] = ay; linePos[lIdx + 2] = az;
          linePos[lIdx + 3] = bx; linePos[lIdx + 4] = by; linePos[lIdx + 5] = bz;

          const alpha = 1 - dist / 5.0;

          // Sky blue to slate indigo gradient
          lineCol[lIdx] = 0.22 * alpha;    // R
          lineCol[lIdx + 1] = 0.74 * alpha; // G
          lineCol[lIdx + 2] = 0.97 * alpha; // B (#38bdf8)

          lineCol[lIdx + 3] = 0.50 * alpha; // R
          lineCol[lIdx + 4] = 0.55 * alpha; // G
          lineCol[lIdx + 5] = 0.97 * alpha; // B (#818cf8)

          lineIdx++;
        }
      }
    }

    for (let k = lineIdx; k < lineMaxCount; k++) {
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

// 3D Skill Sphere Matrix Configuration (Refined Colors)
export function initSkillCloud(containerId, onSkillSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  const width = container.clientWidth || 450;
  const height = container.clientHeight || 450;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 10;

  const skillsList = [
    { name: 'Python', category: 'Data Science', desc: 'Data analytics, machine learning pipelines, scripting, NumPy, Pandas, Scikit-Learn.' },
    { name: 'SQL', category: 'Data Science', desc: 'Relational databases, complex queries, indexing, joins, MySQL & PostgreSQL.' },
    { name: 'Machine Learning', category: 'Data Science', desc: 'Predictive modeling, classification, regression, neural network foundations.' },
    { name: 'Web Dev', category: 'Software Engineering', desc: 'Modern HTML5, responsive CSS3, JavaScript ES6+, interactive web apps.' },
    { name: 'Three.js', category: 'Software Engineering', desc: 'WebGL 3D graphics rendering, shaders, custom geometries, camera math.' },
    { name: 'Data Visualization', category: 'Analytics', desc: 'Interactive charts, Matplotlib, Seaborn, executive dashboards.' },
    { name: 'Graphic Design', category: 'Design', desc: 'UI/UX layout design, visual assets, brand identity, vector media.' },
    { name: 'Git & GitHub', category: 'Tools', desc: 'Version control, branch workflows, collaborative development.' },
    { name: 'Excel / Sheets', category: 'Analytics', desc: 'Advanced formulas, pivot tables, statistical logic, data modeling.' },
    { name: 'Problem Solving', category: 'Core Logic', desc: 'Algorithmic thinking, log analysis, system diagnostics, software debugging.' }
  ];

  const skillObjects = [];
  const radius = 3.6;
  const nodeCount = skillsList.length;

  for (let i = 0; i < nodeCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / nodeCount);
    const theta = Math.sqrt(nodeCount * Math.PI) * phi;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.userData = { skill: skillsList[i] };

    const sphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x38bdf8 : 0x818cf8,
      transparent: true,
      opacity: 0.85
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphereMesh);

    const sprite = createTextSprite(skillsList[i].name, i % 2 === 0 ? '#38bdf8' : '#c084fc');
    sprite.position.y = 0.32;
    group.add(sprite);

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12
    });
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z)];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);

    scene.add(group);
    skillObjects.push(group);
  }

  function createTextSprite(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 256, 64);
    ctx.font = '600 20px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = color;
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.5, 0.38, 1);
    return sprite;
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let targetRotation = { x: 0, y: 0 };
  let currentRotation = { x: 0, y: 0 };
  let hoveredObject = null;

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

      targetRotation.y += deltaX * 0.004;
      targetRotation.x += deltaY * 0.004;

      prevMousePos = { x: e.clientX, y: e.clientY };
    }
  });

  renderer.domElement.addEventListener('click', () => {
    if (isDragging) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    for (let i = 0; i < intersects.length; i++) {
      let obj = intersects[i].object;
      while (obj && obj !== scene) {
        if (obj.userData && obj.userData.skill) {
          const skill = obj.userData.skill;

          gsap.fromTo(obj.scale,
            { x: 1, y: 1, z: 1 },
            { x: 1.4, y: 1.4, z: 1.4, duration: 0.2, yoyo: true, repeat: 1 }
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

  const resizeObs = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    }
  });
  resizeObs.observe(container);

  function renderLoop() {
    requestAnimationFrame(renderLoop);

    if (!isDragging) {
      targetRotation.y += 0.0015;
      targetRotation.x *= 0.95;
    }

    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;

    skillObjects.forEach((obj) => {
      const skill = obj.userData.skill;
      const index = skillsList.indexOf(skill);
      const phi = Math.acos(-1 + (2 * index) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      let rx = radius * Math.sin(phi) * Math.cos(theta + currentRotation.y);
      let ry = radius * Math.sin(phi) * Math.sin(theta + currentRotation.y);
      let rz = radius * Math.cos(phi);

      const tempY = ry * Math.cos(currentRotation.x) - rz * Math.sin(currentRotation.x);
      const tempZ = ry * Math.sin(currentRotation.x) + rz * Math.cos(currentRotation.x);

      obj.position.set(rx, tempY, tempZ);

      const label = obj.children[1];
      if (label) {
        label.quaternion.copy(camera.quaternion);
      }
    });

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
          gsap.to(hoveredObject.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
        }
        hoveredObject = activeHover;
        gsap.to(hoveredObject.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.2 });
        renderer.domElement.style.cursor = 'pointer';
      }
    } else if (hoveredObject) {
      gsap.to(hoveredObject.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
      hoveredObject = null;
      renderer.domElement.style.cursor = isDragging ? 'grabbing' : 'grab';
    }

    renderer.render(scene, camera);
  }

  renderLoop();
}
