import * as THREE from 'three';
import { gsap } from 'gsap';

// Main Page Background & 3D Interactive Elements Configuration
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

  // Ambient & Directional Lights for 3D Shading
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x00f3ff, 2.5, 50);
  pointLight1.position.set(12, 10, 10);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x9d4edd, 2.5, 50);
  pointLight2.position.set(-12, -10, 5);
  scene.add(pointLight2);

  // 1. FLOATING 3D INTERACTIVE GEOMETRIES (Cyber Objects)
  const floatingObjectsGroup = new THREE.Group();
  scene.add(floatingObjectsGroup);

  // Object A: Glowing Wireframe Torus Knot (Main Hero 3D Centerpiece)
  const torusKnotGeo = new THREE.TorusKnotGeometry(2.2, 0.5, 128, 32);
  const torusKnotMat = new THREE.MeshStandardMaterial({
    color: 0x00f3ff,
    wireframe: true,
    emissive: 0x005577,
    roughness: 0.2,
    metalness: 0.8
  });
  const torusKnot = new THREE.Mesh(torusKnotGeo, torusKnotMat);
  torusKnot.position.set(8, 2, -2);
  floatingObjectsGroup.add(torusKnot);

  // Outer Glowing Cyber Ring for Torus Knot
  const ringGeo = new THREE.RingGeometry(3.5, 3.6, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00f3ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4
  });
  const cyberRing1 = new THREE.Mesh(ringGeo, ringMat);
  cyberRing1.position.copy(torusKnot.position);
  cyberRing1.rotation.x = Math.PI / 3;
  floatingObjectsGroup.add(cyberRing1);

  // Object B: Cyber Icosahedron (Floating Top Left)
  const icoGeo = new THREE.IcosahedronGeometry(1.6, 1);
  const icoMat = new THREE.MeshStandardMaterial({
    color: 0x9d4edd,
    wireframe: true,
    emissive: 0x3c096c,
    roughness: 0.1,
    metalness: 0.9
  });
  const icoMesh = new THREE.Mesh(icoGeo, icoMat);
  icoMesh.position.set(-9, 5, -4);
  floatingObjectsGroup.add(icoMesh);

  // Inner Core Sphere for Icosahedron
  const coreGeo = new THREE.SphereGeometry(0.7, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xff007f,
    transparent: true,
    opacity: 0.7
  });
  const coreSphere = new THREE.Mesh(coreGeo, coreMat);
  coreSphere.position.copy(icoMesh.position);
  floatingObjectsGroup.add(coreSphere);

  // Object C: Octahedron Data Crystal (Floating Bottom Right)
  const octaGeo = new THREE.OctahedronGeometry(1.4, 0);
  const octaMat = new THREE.MeshStandardMaterial({
    color: 0x00f3ff,
    wireframe: true,
    emissive: 0x003344,
    metalness: 0.8
  });
  const octaMesh = new THREE.Mesh(octaGeo, octaMat);
  octaMesh.position.set(9, -7, -3);
  floatingObjectsGroup.add(octaMesh);

  // Store interactive 3D meshes for mouse picking
  const interactive3DMeshes = [torusKnot, icoMesh, octaMesh];

  // 2. PARTICLE CONSTELLATION NETWORK SYSTEM
  const particleCount = 280;
  const areaSize = 40;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * areaSize;
    positions[i + 1] = (Math.random() - 0.5) * areaSize;
    positions[i + 2] = (Math.random() - 0.5) * areaSize;

    velocities.push({
      x: (Math.random() - 0.5) * 0.025,
      y: (Math.random() - 0.5) * 0.025,
      z: (Math.random() - 0.5) * 0.025
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Glow texture for particles
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 32;
  pCanvas.height = 32;
  const pCtx = pCanvas.getContext('2d');
  const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.3, 'rgba(0, 243, 255, 0.6)');
  grad.addColorStop(0.7, 'rgba(157, 78, 221, 0.2)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  pCtx.fillStyle = grad;
  pCtx.fillRect(0, 0, 32, 32);
  const pTexture = new THREE.CanvasTexture(pCanvas);

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.5,
    map: pTexture,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const starField = new THREE.Points(geometry, particleMaterial);
  scene.add(starField);

  // Line Connection Network
  const lineMaxCount = 350;
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(lineMaxCount * 2 * 3);
  const lineColors = new Float32Array(lineMaxCount * 2 * 3);

  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    transparent: true,
    opacity: 0.25,
    vertexColors: true,
    blending: THREE.AdditiveBlending
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  // Mouse Interaction setup
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  let hoveredMesh = null;

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Click on 3D objects trigger pulse effect
  window.addEventListener('click', () => {
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    const intersects = raycaster.intersectObjects(interactive3DMeshes);
    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      gsap.fromTo(clickedMesh.scale,
        { x: 1, y: 1, z: 1 },
        { x: 1.6, y: 1.6, z: 1.6, duration: 0.3, yoyo: true, repeat: 1, ease: 'back.out(2)' }
      );
      gsap.to(clickedMesh.rotation, {
        x: clickedMesh.rotation.x + Math.PI * 2,
        y: clickedMesh.rotation.y + Math.PI * 2,
        duration: 0.8
      });
    }
  });

  // Handle Window Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Scroll Tracking
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

    const time = clock.getElapsedTime();

    // Smooth mouse interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Rotate Floating 3D Geometries
    torusKnot.rotation.x = time * 0.3;
    torusKnot.rotation.y = time * 0.4;

    cyberRing1.rotation.z = -time * 0.2;
    cyberRing1.rotation.y = time * 0.15;

    icoMesh.rotation.x = -time * 0.25;
    icoMesh.rotation.y = time * 0.35;
    coreSphere.position.copy(icoMesh.position);

    octaMesh.rotation.x = time * 0.5;
    octaMesh.rotation.z = time * 0.3;

    // Floating bobbing motion for 3D shapes
    torusKnot.position.y = 2 + Math.sin(time * 1.5) * 0.4;
    icoMesh.position.y = 5 + Math.cos(time * 1.2) * 0.5;
    octaMesh.position.y = -7 + Math.sin(time * 1.8) * 0.4;

    // Mouse Parallax & Scroll Movement for Camera
    camera.position.x = Math.sin(scrollPercent * Math.PI * 2) * 6 + mouse.x * 2.5;
    camera.position.y = -scrollPercent * 18 + mouse.y * 2.5;
    camera.position.z = 22 - scrollPercent * 8;
    camera.lookAt(0, -scrollPercent * 18, 0);

    // Mouse Hover Raycasting on 3D Objects
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    const intersects = raycaster.intersectObjects(interactive3DMeshes);
    if (intersects.length > 0) {
      document.body.style.cursor = 'pointer';
      const mesh = intersects[0].object;
      if (hoveredMesh !== mesh) {
        hoveredMesh = mesh;
        gsap.to(mesh.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.25 });
      }
    } else {
      if (hoveredMesh) {
        gsap.to(hoveredMesh.scale, { x: 1, y: 1, z: 1, duration: 0.25 });
        hoveredMesh = null;
      }
      document.body.style.cursor = 'default';
    }

    // Update Particle Systems & Repulsion
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

      // Mouse proximity repulsion
      const dx = posArr[idx] - intersectPoint.x;
      const dy = posArr[idx + 1] - intersectPoint.y;
      const dz = posArr[idx + 2] - intersectPoint.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 4.5) {
        const force = (4.5 - dist) * 0.05;
        posArr[idx] += (dx / dist) * force;
        posArr[idx + 1] += (dy / dist) * force;
        posArr[idx + 2] += (dz / dist) * force;
      }
    }
    geometry.attributes.position.needsUpdate = true;

    // Update Constellation Lines
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
        if (dist < 5.2) {
          const lIdx = lineIdx * 6;

          linePos[lIdx] = ax; linePos[lIdx + 1] = ay; linePos[lIdx + 2] = az;
          linePos[lIdx + 3] = bx; linePos[lIdx + 4] = by; linePos[lIdx + 5] = bz;

          const alpha = 1 - dist / 5.2;

          // Cyan to purple gradient lines
          lineCol[lIdx] = 0.0 * alpha;     // R
          lineCol[lIdx + 1] = 0.95 * alpha; // G (Cyan)
          lineCol[lIdx + 2] = 1.0 * alpha;  // B

          lineCol[lIdx + 3] = 0.6 * alpha;  // R (Purple)
          lineCol[lIdx + 4] = 0.3 * alpha;  // G
          lineCol[lIdx + 5] = 0.9 * alpha;  // B

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

// 3D Skill Sphere Matrix Configuration
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
    { name: 'Python', category: 'Data Science', desc: 'Data analytics, model pipelines, scripting, NumPy, Pandas, Scikit-Learn.' },
    { name: 'SQL', category: 'Data Science', desc: 'Relational databases, complex queries, indexing, joins, MySQL & PostgreSQL.' },
    { name: 'Machine Learning', category: 'Data Science', desc: 'Predictive modeling, classification, regression, neural network basics.' },
    { name: 'Web Dev', category: 'Frontend', desc: 'Modern HTML5, responsive CSS3, JavaScript ES6+, dynamic components.' },
    { name: 'Three.js', category: 'Frontend', desc: 'WebGL 3D rendering, shaders, custom geometries, camera animations.' },
    { name: 'Data Visualization', category: 'Analytics', desc: 'Interactive charts, Matplotlib, Seaborn, Tableau dashboard design.' },
    { name: 'Graphic Design', category: 'Design', desc: 'UI/UX wireframing, visual assets, brand identity, vector graphics.' },
    { name: 'Git & GitHub', category: 'Tools', desc: 'Version control, branch management, CI/CD basics, collaborative coding.' },
    { name: 'Excel / Sheets', category: 'Analytics', desc: 'Advanced formulas, pivot tables, statistical functions, data modeling.' },
    { name: 'Problem Solving', category: 'Soft Skills', desc: 'Algorithmic thinking, log analysis, system diagnostics, code debugging.' }
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

    // Core Glowing Sphere Node
    const sphereGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x00f3ff : 0x9d4edd,
      transparent: true,
      opacity: 0.9
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphereMesh);

    // Text Sprite Label
    const sprite = createTextSprite(skillsList[i].name, i % 2 === 0 ? '#00f3ff' : '#d8b4fe');
    sprite.position.y = 0.32;
    group.add(sprite);

    // Connecting line to center
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.15
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
    ctx.font = '600 22px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = color;
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.6, 0.4, 1);
    return sprite;
  }

  // Mouse & Touch Controls
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

      targetRotation.y += deltaX * 0.005;
      targetRotation.x += deltaY * 0.005;

      prevMousePos = { x: e.clientX, y: e.clientY };
    }
  });

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
            { x: 1.5, y: 1.5, z: 1.5, duration: 0.2, yoyo: true, repeat: 1 }
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
      targetRotation.y += 0.002;
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
        gsap.to(hoveredObject.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.2 });
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
