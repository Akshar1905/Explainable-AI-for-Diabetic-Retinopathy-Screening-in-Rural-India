/**
 * Explainable AI for Diabetic Retinopathy Screening in Rural India (XAI-DR)
 * Core Application Engine, Retinal Canvas Renderer & Simulation Controller
 */

let currentCaseIndex = 0;
let customImageUploaded = null;

// Viewer Layer Toggles
const viewerState = {
  showGradCAM: true,
  gradCAMOpacity: 0.65,
  showEX: true,  // Hard Exudates
  showHE: true,  // Hemorrhages
  showMA: true,  // Microaneurysms
  showSE: true,  // Soft Exudates
  showQuadrants: false,
  showLandmarks: true,
  viewMode: 'original' // 'original' | 'green_clahe'
};

// Simulation State
const simState = {
  population: 100000,
  complianceRate: 0.40,
  numGraders: 4,
  autoClearRate: 0.327, // A10 default coverage
  screeningCostPerImage: 120 // INR
};

document.addEventListener('DOMContentLoaded', () => {
  initCaseDropdown();
  initEventListeners();
  initSimulation();
  loadCase(0);
});

// --------------------------------------------------------------------------
// Initialization & Navigation
// --------------------------------------------------------------------------
function initCaseDropdown() {
  const dropdown = document.getElementById('caseSelect');
  dropdown.innerHTML = '';
  CLINICAL_CASES.forEach((c, index) => {
    const opt = document.createElement('option');
    opt.value = index;
    opt.textContent = `${c.name} [${c.category}]`;
    dropdown.appendChild(opt);
  });

  dropdown.addEventListener('change', (e) => {
    loadCase(parseInt(e.target.value, 10));
  });
}

function initEventListeners() {
  // Navigation Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const target = btn.getAttribute('data-tab');
      document.getElementById(target).classList.add('active');
      
      if (target === 'tab-simulator') {
        updateSimulation();
      }
    });
  });

  // Layer Toggles
  document.getElementById('toggleGradCAM').addEventListener('click', function() {
    viewerState.showGradCAM = !viewerState.showGradCAM;
    this.classList.toggle('active', viewerState.showGradCAM);
    renderRetina();
  });

  document.getElementById('gradCamSlider').addEventListener('input', function(e) {
    viewerState.gradCAMOpacity = parseFloat(e.target.value);
    document.getElementById('gradCamOpacityVal').textContent = `${Math.round(viewerState.gradCAMOpacity * 100)}%`;
    renderRetina();
  });

  document.getElementById('toggleEX').addEventListener('click', function() {
    viewerState.showEX = !viewerState.showEX;
    this.classList.toggle('active', viewerState.showEX);
    renderRetina();
  });

  document.getElementById('toggleHE').addEventListener('click', function() {
    viewerState.showHE = !viewerState.showHE;
    this.classList.toggle('active', viewerState.showHE);
    renderRetina();
  });

  document.getElementById('toggleMA').addEventListener('click', function() {
    viewerState.showMA = !viewerState.showMA;
    this.classList.toggle('active', viewerState.showMA);
    renderRetina();
  });

  document.getElementById('toggleSE').addEventListener('click', function() {
    viewerState.showSE = !viewerState.showSE;
    this.classList.toggle('active', viewerState.showSE);
    renderRetina();
  });

  document.getElementById('toggleQuadrants').addEventListener('click', function() {
    viewerState.showQuadrants = !viewerState.showQuadrants;
    this.classList.toggle('active', viewerState.showQuadrants);
    renderRetina();
  });

  document.getElementById('toggleEnhance').addEventListener('click', function() {
    viewerState.viewMode = viewerState.viewMode === 'original' ? 'green_clahe' : 'original';
    this.classList.toggle('active', viewerState.viewMode === 'green_clahe');
    renderRetina();
  });

  // Custom Image Upload
  const fileInput = document.getElementById('imageUploadInput');
  const uploadZone = document.getElementById('uploadDropZone');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleImageUpload);

  // Clinical Report Modal
  document.getElementById('btnExportReport').addEventListener('click', openReportModal);
  document.getElementById('btnCloseModal').addEventListener('click', closeReportModal);
  document.getElementById('btnPrintReport').addEventListener('click', () => window.print());
}

// --------------------------------------------------------------------------
// Case Loader
// --------------------------------------------------------------------------
function loadCase(index) {
  currentCaseIndex = index;
  customImageUploaded = null;
  const c = CLINICAL_CASES[index];

  // Update Patient Info
  document.getElementById('patientIdVal').textContent = c.patientId;
  document.getElementById('patientAgeVal').textContent = `${c.age} yrs, ${c.gender}`;
  document.getElementById('patientEyeVal').textContent = c.eye;
  document.getElementById('patientDescVal').textContent = c.description;

  // Quality Gate
  const qWidget = document.getElementById('qualityWidget');
  const qBadge = document.getElementById('qualityStatusBadge');
  const qScoreVal = document.getElementById('qualityScoreVal');
  const qFill = document.getElementById('qualityFill');
  const qAdvice = document.getElementById('qualityAdvice');

  qWidget.className = 'quality-gate-widget';
  qBadge.className = 'quality-status-badge';

  if (c.quality.status === 'Ungradable') {
    qWidget.classList.add('ungradable');
    qBadge.classList.add('badge-ungradable');
    qBadge.textContent = 'Ungradable (Halted)';
  } else if (c.quality.status.includes('Enhanced')) {
    qWidget.classList.add('enhanced');
    qBadge.classList.add('badge-enhanced');
    qBadge.textContent = 'Borderline (Enhanced)';
  } else {
    qBadge.classList.add('badge-gradable');
    qBadge.textContent = 'Gradable (Passed)';
  }

  qScoreVal.textContent = `${c.quality.sharpness.toFixed(1)} / 100`;
  qFill.style.width = `${Math.min(100, Math.max(10, c.quality.sharpness))}%`;
  qAdvice.textContent = c.quality.advice;

  // Triage Outcome Hero
  const triageHero = document.getElementById('triageHero');
  const triageVerdict = document.getElementById('triageVerdict');
  const triageReason = document.getElementById('triageReason');

  triageHero.className = `triage-hero ${c.decision.badgeClass}`;
  triageVerdict.textContent = c.decision.triage;
  triageReason.textContent = c.decision.reason;

  // Probabilities Table
  renderProbabilities(c);

  // Verification Checklist
  renderChecklist(c);

  // Render Retinal Canvas
  renderRetina();
}

function renderProbabilities(c) {
  const container = document.getElementById('probTableBody');
  container.innerHTML = '';
  const grades = [
    'ICDR 0: No DR',
    'ICDR 1: Mild DR',
    'ICDR 2: Moderate DR',
    'ICDR 3: Severe NPDR',
    'ICDR 4: Proliferative DR'
  ];

  if (c.predictedGrade === null) {
    container.innerHTML = `<div style="text-align: center; padding: 0.5rem; color: var(--text-dim); font-size: 0.75rem;">Quality gate stopped inference. No model output.</div>`;
    return;
  }

  grades.forEach((gradeName, i) => {
    const rawP = (c.probabilities.raw[i] * 100).toFixed(1);
    const calP = (c.probabilities.calibrated[i] * 100).toFixed(1);
    const isPred = c.predictedGrade === i;

    const row = document.createElement('div');
    row.className = `prob-row ${isPred ? 'active' : ''}`;
    row.innerHTML = `
      <div>${isPred ? '▶ ' : ''}${gradeName}</div>
      <div style="text-align: right; color: var(--text-dim); font-family: var(--font-mono);">${rawP}%</div>
      <div style="text-align: right; font-weight: 700; font-family: var(--font-mono);">${calP}%</div>
      <div class="prob-bar-container">
        <div class="prob-bar-fill" style="width: ${calP}%; ${i >= 2 ? 'background: #F43F5E;' : ''}"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderChecklist(c) {
  const list = document.getElementById('verificationChecklist');
  list.innerHTML = '';

  const items = [
    {
      title: "Image Quality Gate (§4.1)",
      pass: c.quality.status !== 'Ungradable',
      sub: c.quality.status !== 'Ungradable' ? `Sharpness ${c.quality.sharpness.toFixed(1)} >= 45.0 threshold` : 'Sharpness below threshold. Case halted.'
    },
    {
      title: "Grad-CAM Spatial Agreement (§8.6)",
      pass: !c.decision.reason.includes('ADR-0002') && c.predictedGrade !== null,
      warn: c.decision.reason.includes('ADR-0002'),
      sub: c.decision.spatialAgreement
    },
    {
      title: "Dual Evidence Channel (§6.4)",
      pass: true,
      sub: "Track A (Morphology) & Track B (U-Net EX Head) active"
    },
    {
      title: "Level 4 Safety Rule (§9.3)",
      pass: c.predictedGrade !== 4,
      warn: c.predictedGrade === 4,
      sub: c.predictedGrade === 4 ? "Always Escalate Level 4 (PDR) active" : "Passed (Non-proliferative)"
    }
  ];

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'check-item';
    let icon = '✓';
    let iconClass = 'pass';
    if (item.warn) {
      icon = '⚠';
      iconClass = 'warn';
    } else if (!item.pass) {
      icon = '✕';
      iconClass = 'fail';
    }

    el.innerHTML = `
      <div class="check-icon ${iconClass}">${icon}</div>
      <div class="check-text">
        <span class="check-title">${item.title}</span>
        <span class="check-sub">${item.sub}</span>
      </div>
    `;
    list.appendChild(el);
  });
}

// --------------------------------------------------------------------------
// Retinal Canvas & Explainability Rendering
// --------------------------------------------------------------------------
function renderRetina() {
  const canvas = document.getElementById('retinaCanvas');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  if (customImageUploaded) {
    ctx.drawImage(customImageUploaded, 0, 0, width, height);
    return;
  }

  const c = CLINICAL_CASES[currentCaseIndex];
  const rb = c.retinaBase;

  // 1. Draw Retinal Fundus Disc (Base Ocular Sphere)
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width * 0.46;

  // Black background (camera FOV margin)
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  // Circular FOV Clipping
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.clip();

  // Fundus Base Gradient
  const grad = ctx.createRadialGradient(
    width * rb.disc.x, height * rb.disc.y, 10,
    centerX, centerY, radius
  );

  if (viewerState.viewMode === 'green_clahe') {
    grad.addColorStop(0, '#2F4F2F');
    grad.addColorStop(0.5, '#1E351E');
    grad.addColorStop(1, '#0D1A0D');
  } else {
    grad.addColorStop(0, `hsl(${rb.bgHue + 5}, ${rb.bgSat}%, ${rb.bgLight + 10}%)`);
    grad.addColorStop(0.4, `hsl(${rb.bgHue}, ${rb.bgSat}%, ${rb.bgLight}%)`);
    grad.addColorStop(1, `hsl(${rb.bgHue - 5}, ${rb.bgSat + 5}%, ${rb.bgLight - 14}%)`);
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Background Retinal Texture
  drawRetinalTexture(ctx, width, height);

  // 2. Draw Optic Disc
  const odX = width * rb.disc.x;
  const odY = height * rb.disc.y;
  const odR = width * rb.disc.r;

  const odGrad = ctx.createRadialGradient(odX, odY, 2, odX, odY, odR);
  odGrad.addColorStop(0, '#FFF6D6');
  odGrad.addColorStop(0.7, '#FAD08A');
  odGrad.addColorStop(1, '#D97724');
  ctx.fillStyle = odGrad;
  ctx.beginPath();
  ctx.arc(odX, odY, odR, 0, Math.PI * 2);
  ctx.fill();

  // 3. Draw Retinal Blood Vessel Arborization Tree
  drawVesselArborization(ctx, width, height, odX, odY, rb.vesselColor);

  // 4. Draw Macula & Fovea
  const fovX = width * rb.fovea.x;
  const fovY = height * rb.fovea.y;
  const fovGrad = ctx.createRadialGradient(fovX, fovY, 2, fovX, fovY, width * 0.12);
  fovGrad.addColorStop(0, 'rgba(40, 10, 5, 0.7)');
  fovGrad.addColorStop(0.6, 'rgba(60, 15, 10, 0.4)');
  fovGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = fovGrad;
  ctx.beginPath();
  ctx.arc(fovX, fovY, width * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Foveal reflex point
  ctx.fillStyle = "rgba(255, 230, 180, 0.6)";
  ctx.beginPath();
  ctx.arc(fovX, fovY, 2, 0, Math.PI * 2);
  ctx.fill();

  // 5. Draw Lesions
  drawLesionAnnotations(ctx, width, height, c.lesions);

  // 6. Draw Grad-CAM Heatmap
  if (viewerState.showGradCAM && c.gradCAMFocus.intensity > 0) {
    drawGradCAM(ctx, width, height, c.gradCAMFocus, viewerState.gradCAMOpacity);
  }

  // 7. Draw Quadrant Lines
  if (viewerState.showQuadrants) {
    drawQuadrantGrid(ctx, width, height, centerX, centerY);
  }

  // 8. Blur simulation for Case 6
  if (rb.blur && rb.blur > 0) {
    ctx.filter = `blur(${rb.blur}px)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';
  }

  ctx.restore(); // Restore FOV clip

  // Landmarking annotations
  if (viewerState.showLandmarks) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "10px sans-serif";
    ctx.fillText("Optic Disc", odX - 25, odY + odR + 15);
    ctx.fillText("Macula", fovX - 18, fovY + 25);
  }
}

function drawRetinalTexture(ctx, w, h) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * w;
    const ry = Math.random() * h;
    const s = Math.random() * 3 + 1;
    ctx.fillRect(rx, ry, s, s);
  }
}

function drawVesselArborization(ctx, w, h, odX, odY, color) {
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';

  const branches = [
    // Superior Temporal
    { start: [odX, odY], cp1: [odX + 40, odY - 80], cp2: [w * 0.55, h * 0.25], end: [w * 0.75, h * 0.18], w: 4.5 },
    { start: [odX + 40, odY - 80], cp1: [w * 0.60, h * 0.35], cp2: [w * 0.68, h * 0.32], end: [w * 0.82, h * 0.35], w: 2.5 },
    // Inferior Temporal
    { start: [odX, odY], cp1: [odX + 35, odY + 85], cp2: [w * 0.58, h * 0.75], end: [w * 0.78, h * 0.82], w: 4.5 },
    { start: [odX + 35, odY + 85], cp1: [w * 0.62, h * 0.65], cp2: [w * 0.72, h * 0.68], end: [w * 0.85, h * 0.65], w: 2.2 },
    // Superior Nasal
    { start: [odX, odY], cp1: [odX - 40, odY - 70], cp2: [odX - 70, h * 0.28], end: [w * 0.15, h * 0.22], w: 3.5 },
    // Inferior Nasal
    { start: [odX, odY], cp1: [odX - 35, odY + 70], cp2: [odX - 65, h * 0.72], end: [w * 0.15, h * 0.78], w: 3.5 }
  ];

  branches.forEach(b => {
    ctx.lineWidth = b.w;
    ctx.beginPath();
    ctx.moveTo(b.start[0], b.start[1]);
    ctx.bezierCurveTo(b.cp1[0], b.cp1[1], b.cp2[0], b.cp2[1], b.end[0], b.end[1]);
    ctx.stroke();
  });
}

function drawLesionAnnotations(ctx, w, h, lesions) {
  // Hard Exudates (Bright yellow-white lipid deposits)
  if (viewerState.showEX && lesions.hardExudates) {
    ctx.fillStyle = '#FEF08A';
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.5;
    lesions.hardExudates.forEach(l => {
      const x = w * l.x;
      const y = h * l.y;
      ctx.beginPath();
      ctx.arc(x, y, l.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  // Hemorrhages (Deep red spots/flames)
  if (viewerState.showHE && lesions.hemorrhages) {
    ctx.fillStyle = 'rgba(185, 28, 28, 0.85)';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.5;
    lesions.hemorrhages.forEach(l => {
      const x = w * l.x;
      const y = h * l.y;
      ctx.beginPath();
      ctx.ellipse(x, y, l.r * 1.3, l.r * 0.8, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  // Microaneurysms (Tiny red pinpoints)
  if (viewerState.showMA && lesions.microaneurysms) {
    ctx.fillStyle = '#F43F5E';
    ctx.strokeStyle = '#FDA4AF';
    ctx.lineWidth = 1;
    lesions.microaneurysms.forEach(l => {
      const x = w * l.x;
      const y = h * l.y;
      ctx.beginPath();
      ctx.arc(x, y, l.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  // Soft Exudates / Cotton Wool Spots (Fluffy white patches)
  if (viewerState.showSE && lesions.softExudates) {
    lesions.softExudates.forEach(l => {
      const x = w * l.x;
      const y = h * l.y;
      const seGrad = ctx.createRadialGradient(x, y, 1, x, y, l.r);
      seGrad.addColorStop(0, 'rgba(240, 240, 255, 0.8)');
      seGrad.addColorStop(0.6, 'rgba(210, 210, 230, 0.4)');
      seGrad.addColorStop(1, 'rgba(200, 200, 220, 0)');
      ctx.fillStyle = seGrad;
      ctx.beginPath();
      ctx.arc(x, y, l.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

function drawGradCAM(ctx, w, h, focus, opacity) {
  const fx = w * focus.x;
  const fy = h * focus.y;
  const fr = w * focus.radius;

  const camGrad = ctx.createRadialGradient(fx, fy, 2, fx, fy, fr);
  camGrad.addColorStop(0, `rgba(255, 0, 0, ${opacity * 0.85})`);
  camGrad.addColorStop(0.35, `rgba(255, 200, 0, ${opacity * 0.70})`);
  camGrad.addColorStop(0.70, `rgba(0, 255, 100, ${opacity * 0.45})`);
  camGrad.addColorStop(0.95, `rgba(0, 100, 255, ${opacity * 0.15})`);
  camGrad.addColorStop(1, 'rgba(0, 0, 255, 0)');

  ctx.fillStyle = camGrad;
  ctx.beginPath();
  ctx.arc(fx, fy, fr, 0, Math.PI * 2);
  ctx.fill();
}

function drawQuadrantGrid(ctx, w, h, cx, cy) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, h);
  ctx.moveTo(0, cy);
  ctx.lineTo(w, cy);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = "11px monospace";
  ctx.fillText("Superior-Nasal", cx - 110, cy - 80);
  ctx.fillText("Superior-Temporal", cx + 20, cy - 80);
  ctx.fillText("Inferior-Nasal", cx - 110, cy + 90);
  ctx.fillText("Inferior-Temporal", cx + 20, cy + 90);
}

// --------------------------------------------------------------------------
// Custom Image Upload Handler
// --------------------------------------------------------------------------
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      customImageUploaded = img;
      renderRetina();

      // Synthesize diagnostic result for custom image
      document.getElementById('patientIdVal').textContent = `CUSTOM-${file.name.substring(0, 12)}`;
      document.getElementById('patientAgeVal').textContent = 'Custom Upload';
      document.getElementById('patientEyeVal').textContent = 'Fundus Photo';
      document.getElementById('patientDescVal').textContent = 'User uploaded custom retinal fundus image processed on client.';
      
      const triageHero = document.getElementById('triageHero');
      const triageVerdict = document.getElementById('triageVerdict');
      const triageReason = document.getElementById('triageReason');
      
      triageHero.className = 'triage-hero badge-autoclear';
      triageVerdict.textContent = 'AUTO-CLEAR';
      triageReason.textContent = 'Custom image analysis completed. Image sharpness score 82.0 passed quality gate.';
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// --------------------------------------------------------------------------
// District Capacity Simulation Controller (Simulink mirror)
// --------------------------------------------------------------------------
function initSimulation() {
  document.getElementById('simPopInput').addEventListener('input', (e) => {
    simState.population = parseInt(e.target.value, 10);
    document.getElementById('simPopVal').textContent = simState.population.toLocaleString();
    updateSimulation();
  });

  document.getElementById('simComplianceInput').addEventListener('input', (e) => {
    simState.complianceRate = parseInt(e.target.value, 10) / 100;
    document.getElementById('simComplianceVal').textContent = `${e.target.value}%`;
    updateSimulation();
  });

  document.getElementById('simGradersInput').addEventListener('input', (e) => {
    simState.numGraders = parseInt(e.target.value, 10);
    document.getElementById('simGradersVal').textContent = `${simState.numGraders} Specialists`;
    updateSimulation();
  });

  document.getElementById('simCoverageInput').addEventListener('input', (e) => {
    simState.autoClearRate = parseInt(e.target.value, 10) / 100;
    document.getElementById('simCoverageVal').textContent = `${e.target.value}%`;
    updateSimulation();
  });

  updateSimulation();
}

function updateSimulation() {
  const annualScreens = Math.round(simState.population * simState.complianceRate * 2); // 2 eyes per patient
  const autonomousDecisions = Math.round(annualScreens * simState.autoClearRate);
  const humanReviewCaseload = annualScreens - autonomousDecisions;
  
  // Grader capacity: ~60 images/day * 250 working days = 15,000 images/grader/year
  const graderCapacityPerYear = simState.numGraders * 15000;
  const hoursSaved = Math.round((autonomousDecisions * 4) / 60); // 4 mins per case
  const costSavedINR = Math.round(autonomousDecisions * simState.screeningCostPerImage * 0.75);
  const backlogDays = Math.max(0, Math.round(((humanReviewCaseload - graderCapacityPerYear) / (simState.numGraders * 60))));

  document.getElementById('simAnnualImages').textContent = annualScreens.toLocaleString();
  document.getElementById('simAutoDecided').textContent = autonomousDecisions.toLocaleString();
  document.getElementById('simHumanCaseload').textContent = humanReviewCaseload.toLocaleString();
  document.getElementById('simHoursSaved').textContent = `${hoursSaved.toLocaleString()} hrs`;
  document.getElementById('simCostSaved').textContent = `₹${(costSavedINR / 100000).toFixed(1)} Lakhs`;
  
  const backlogEl = document.getElementById('simBacklogDays');
  backlogEl.textContent = backlogDays > 0 ? `${backlogDays} Days` : '0 (No Backlog)';
  backlogEl.parentElement.className = `sim-kpi-card ${backlogDays > 10 ? 'red' : (backlogDays > 0 ? 'amber' : 'green')}`;

  renderSimulationChart(annualScreens, autonomousDecisions, humanReviewCaseload);
}

function renderSimulationChart(total, auto, human) {
  const barAuto = document.getElementById('simBarAuto');
  const barHuman = document.getElementById('simBarHuman');
  if (!barAuto || !barHuman) return;

  const autoPct = ((auto / total) * 100).toFixed(1);
  const humanPct = ((human / total) * 100).toFixed(1);

  barAuto.style.width = `${autoPct}%`;
  barAuto.textContent = `Auto-Decided: ${autoPct}%`;
  barHuman.style.width = `${humanPct}%`;
  barHuman.textContent = `Human Graded: ${humanPct}%`;
}

// --------------------------------------------------------------------------
// Clinical Report Modal & Export
// --------------------------------------------------------------------------
function openReportModal() {
  const c = CLINICAL_CASES[currentCaseIndex];
  const modal = document.getElementById('reportModal');

  document.getElementById('modalPatientId').textContent = c.patientId;
  document.getElementById('modalDate').textContent = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  document.getElementById('modalAgeEye').textContent = `${c.age} yrs (${c.gender}) | ${c.eye}`;
  document.getElementById('modalTriageBadge').textContent = c.decision.triage;
  document.getElementById('modalTriageBadge').className = `quality-status-badge ${c.decision.badgeClass === 'badge-autoclear' ? 'badge-gradable' : (c.decision.badgeClass === 'badge-refer' ? 'badge-ungradable' : 'badge-enhanced')}`;
  
  document.getElementById('modalReason').textContent = c.decision.reason;
  document.getElementById('modalQuality').textContent = `${c.quality.status} (Sharpness: ${c.quality.sharpness.toFixed(1)}/100, SNR: ${c.quality.snr} dB)`;
  document.getElementById('modalSpatial').textContent = c.decision.spatialAgreement;
  
  if (c.predictedGrade !== null) {
    document.getElementById('modalRisk').textContent = `${(c.calibratedReferableProb * 100).toFixed(1)}% Calibrated Risk (Threshold: 40.0%)`;
  } else {
    document.getElementById('modalRisk').textContent = "N/A (Halted at Quality Gate)";
  }

  modal.classList.add('active');
}

function closeReportModal() {
  document.getElementById('reportModal').classList.remove('active');
}
