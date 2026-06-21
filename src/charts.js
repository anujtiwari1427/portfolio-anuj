// HTML5 Canvas Chart and Data Science Node Visualizer
let activeAnimationId = null;

export function drawSkillChart(canvasId, skill) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Cancel previous animation frame to prevent overlaps
  if (activeAnimationId) {
    cancelAnimationFrame(activeAnimationId);
  }

  // Adjust resolution for Retina screens
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  // Skill node structures
  const skillNodesData = {
    'Python': [
      { name: 'Pandas', val: 0.9 },
      { name: 'NumPy', val: 0.85 },
      { name: 'Scikit-Learn', val: 0.7 },
      { name: 'Matplotlib', val: 0.8 },
      { name: 'Seaborn', val: 0.75 },
      { name: 'Scripting', val: 0.85 }
    ],
    'SQL': [
      { name: 'SELECT/JOINs', val: 0.95 },
      { name: 'Subqueries', val: 0.8 },
      { name: 'Aggregation', val: 0.85 },
      { name: 'PostgreSQL', val: 0.7 },
      { name: 'Normalization', val: 0.75 }
    ],
    'Web Dev': [
      { name: 'HTML5', val: 0.9 },
      { name: 'CSS3', val: 0.85 },
      { name: 'Vanilla JS', val: 0.75 },
      { name: 'Responsive UI', val: 0.8 },
      { name: 'Canvas API', val: 0.7 }
    ],
    'Graphic Design': [
      { name: 'Canva', val: 0.95 },
      { name: 'Adobe suite', val: 0.65 },
      { name: 'UI Layouts', val: 0.75 },
      { name: 'Color Schemes', val: 0.8 }
    ],
    'Data Analysis': [
      { name: 'Data Cleanup', val: 0.9 },
      { name: 'EDA', val: 0.85 },
      { name: 'Reporting', val: 0.8 },
      { name: 'Excel Charts', val: 0.9 }
    ],
    'Excel': [
      { name: 'Pivot Tables', val: 0.95 },
      { name: 'Formulas', val: 0.9 },
      { name: 'Power Query', val: 0.7 },
      { name: 'Data Sorting', val: 0.9 }
    ],
    'Google Workspace': [
      { name: 'Docs & Sheets', val: 0.9 },
      { name: 'Drive Share', val: 0.85 },
      { name: 'Forms/Surveys', val: 0.8 }
    ],
    'Troubleshooting': [
      { name: 'Script Debugs', val: 0.85 },
      { name: 'Dev Server', val: 0.8 },
      { name: 'Local Configs', val: 0.75 }
    ],
    'Online Teaching': [
      { name: 'Zoom/Meet', val: 0.95 },
      { name: 'MS Teams', val: 0.85 },
      { name: 'Class Slides', val: 0.8 }
    ],
    'Digital Literacy': [
      { name: 'Web Scraping', val: 0.75 },
      { name: 'Researching', val: 0.9 },
      { name: 'Prompt Eng.', val: 0.85 }
    ]
  };

  const subNodes = skillNodesData[skill.name] || [
    { name: 'Database', val: 0.8 },
    { name: 'Algorithm', val: 0.75 },
    { name: 'Analytics', val: 0.8 }
  ];

  // Minimal white accent color for chart
  const primaryColor = 'rgba(255, 255, 255, 0.7)';
  const accentColor = 'rgba(255, 255, 255, 0.35)';

  // Track local mouse coordinates inside canvas
  const mouse = { x: -100, y: -100 };
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -100;
    mouse.y = -100;
  });

  // Orbital Nodes setup
  const centerX = width / 2;
  const centerY = height / 2 - 10;
  const nodes = subNodes.map((n, idx) => {
    const angle = (idx / subNodes.length) * Math.PI * 2;
    const distance = 70 + Math.random() * 15;
    return {
      name: n.name,
      val: n.val,
      angle: angle,
      distance: distance,
      orbitSpeed: 0.005 + Math.random() * 0.005,
      radius: 8 + n.val * 6,
      x: 0,
      y: 0
    };
  });

  let waveOffset = 0;

  function animate() {
    activeAnimationId = requestAnimationFrame(animate);

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Grid Lines in Background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Draw Orbit Guides
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Draw Connections from Center to Sub-nodes
    nodes.forEach(node => {
      node.angle += node.orbitSpeed;
      node.x = centerX + Math.cos(node.angle) * node.distance;
      node.y = centerY + Math.sin(node.angle) * node.distance;

      // Draw connection line
      const dx = mouse.x - node.x;
      const dy = mouse.y - node.y;
      const hovered = Math.sqrt(dx * dx + dy * dy) < node.radius + 4;

      ctx.strokeStyle = hovered ? 'rgba(255,255,255,0.5)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = hovered ? 1.5 : 0.5;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();
    });

    // 4. Draw Central Node
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
    
    // Gradient fill for core — minimal glass effect
    const coreGrad = ctx.createRadialGradient(centerX, centerY, 3, centerX, centerY, 24);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    coreGrad.addColorStop(0.5, 'rgba(120, 120, 120, 0.3)');
    coreGrad.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = coreGrad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw central node text
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '9px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CORE', centerX, centerY);

    // 5. Draw Sub-nodes
    let hoveredNode = null;

    nodes.forEach(node => {
      const dx = mouse.x - node.x;
      const dy = mouse.y - node.y;
      const hovered = Math.sqrt(dx * dx + dy * dy) < node.radius + 4;

      if (hovered) {
        hoveredNode = node;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

      const nodeGrad = ctx.createRadialGradient(node.x, node.y, 1, node.x, node.y, node.radius);
      nodeGrad.addColorStop(0, hovered ? 'rgba(255,255,255,0.9)' : 'rgba(200,200,200,0.5)');
      nodeGrad.addColorStop(1, 'rgba(10, 10, 10, 0.8)');
      ctx.fillStyle = nodeGrad;
      ctx.fill();

      ctx.strokeStyle = hovered ? 'rgba(255,255,255,0.5)' : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = hovered ? 1.5 : 0.5;
      ctx.stroke();

      // Mini text labels next to sub-nodes
      ctx.fillStyle = hovered ? 'rgba(255,255,255,0.9)' : 'rgba(255, 255, 255, 0.4)';
      ctx.font = hovered ? '600 10px "Outfit", sans-serif' : '10px "Outfit", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.name, node.x + node.radius + 6, node.y);
    });

    // 6. Draw Wave Analyzer Footer (represents active data stream)
    waveOffset += 0.05;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < width; i++) {
      const y = height - 20 + Math.sin(i * 0.015 + waveOffset) * 8 * Math.cos(i * 0.003);
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();

    // 7. Draw Tooltip for Hovered Node
    if (hoveredNode) {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.92)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 0.5;
      
      const tooltipW = 120;
      const tooltipH = 45;
      const tx = Math.min(mouse.x + 10, width - tooltipW - 10);
      const ty = Math.max(mouse.y - tooltipH - 10, 10);

      // Tooltip Card
      ctx.beginPath();
      ctx.roundRect(tx, ty, tooltipW, tooltipH, 6);
      ctx.fill();
      ctx.stroke();

      // Tooltip Title
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '600 10px "Outfit", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(hoveredNode.name, tx + 8, ty + 15);

      // Tooltip Value / Confidence
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '9px "Fira Code", monospace';
      ctx.fillText(`${(hoveredNode.val * 100).toFixed(0)}%`, tx + 8, ty + 30);
    }
  }

  animate();
}
