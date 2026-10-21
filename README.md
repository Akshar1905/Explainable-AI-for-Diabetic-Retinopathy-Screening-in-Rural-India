# Explainable AI for Diabetic Retinopathy Screening in Rural India

**Project Short Name:** XAI-DR Screening  
**Domain:** Medical Image Analysis · Explainable Artificial Intelligence (XAI) · Healthcare Telemedicine  

---

## Overview

Diabetic Retinopathy (DR) is a leading cause of preventable blindness worldwide and is particularly acute in rural and underserved regions of India, where the ratio of ophthalmologists to patients is severely constrained. Mass screening requires inspecting high-resolution retinal fundus photographs of diabetic patients to detect microscopic vascular lesions before irreversible vision loss occurs.

This project implements a clinical decision-support and screening pipeline designed specifically for rural tele-ophthalmology workflows. Built primarily in MATLAB with an accompanying App Designer user interface, standalone explainability console, and a Simulink/SimEvents district healthcare capacity simulation model, the system processes color fundus images to categorize patients into a three-way triage outcome: **Auto-Clear**, **Refer**, or **Escalate to Human Clinician**.

Crucially, the system enforces clinical safety and interpretability:
- **Calibrated Risk:** Predicted probabilities from a ResNet-50 grading backbone are calibrated using temperature scaling ($T = 2.1414$), ensuring that predicted probabilities correspond to empirical frequencies.
- **Explainability:** Regional attention heatmaps generated via Grad-CAM are cross-verified against localized lesion segmentations from an independent multi-head U-Net and classical morphological detectors.
- **Safety Veto & Disagreement Policies:** When image quality is ungradable, when uncertainty is high, or when model attention contradicts detected lesion pathology, the system refuses to guess and escalates the case to a specialist.

---

## Problem Statement

In rural Indian primary healthcare centres (PHCs), eye-care infrastructure is limited. While community health workers can acquire digital fundus photographs using portable cameras, each image traditionally requires manual examination by an ophthalmologist. More than 60% of screened eyes in routine screening programs are non-referable (normal or mild DR). Human evaluation of every normal image overwhelms district hospitals, creating clinical backlogs that delay treatment for patients with sight-threatening retinopathy.

Existing automated deep learning algorithms often act as opaque "black boxes," reporting uncalibrated confidence scores and lacking lesion-level accountability. Furthermore, binary (Refer / Don't Refer) classification forces models to make high-stakes guesses on low-quality or ambiguous images, leading to unacceptable false-negative rates in real-world deployments.

---

## Objectives

1. **Automated Quality Verification:** Implement an upfront quality gate to identify blur, underexposure, or poor field-of-view (FOV) alignment before invoking machine-learning inference.
2. **Standardized Severity Grading:** Classify retinal images according to the International Clinical Diabetic Retinopathy (ICDR) 5-point scale (Level 0: No DR, Level 1: Mild, Level 2: Moderate, Level 3: Severe NPDR, Level 4: Proliferative DR).
3. **Calibrated Confidence Estimation:** Scale classification logits via temperature scaling to prevent overconfident misdiagnoses.
4. **Independent Dual-Track Lesion Evidence:** Extract explicit lesion evidence (Hard Exudates, Hemorrhages, Microaneurysms, Soft Exudates) using U-Net semantic segmentation and morphological candidate detectors.
5. **Spatial Explainability & Safety Veto:** Evaluate spatial overlap between Grad-CAM activation maps and detected lesions. Enforce a zero-miss equal-coverage safety policy (ADR-0001).
6. **Cost-Sensitive Decision Triage:** Route cases into **Auto-Clear** (healthy), **Refer** (referable DR), or **Escalate** (mandatory clinician review for Level 4, ungradable, or conflicting evidence).
7. **Comprehensive Clinical Reporting:** Generate automated, multi-panel diagnostic summaries with visual heatmaps, lesion distributions, and structured rationale.
8. **District Healthcare Sizing:** Model rural patient arrival rates, tele-screening bandwidth, and grader workload using discrete-event Simulink / SimEvents modeling.

---

## System Architecture

```
                                  [ Raw Fundus Image ]
                                           │
                                           ▼
                            ┌─────────────────────────────┐
                            │   Stage 1: Quality Gate     │
                            │   (Sharpness, SNR, FOV)     │
                            └──────────────┬──────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │ Gradable / Enhanced                         │ Ungradable
                    ▼                                             ▼
     ┌─────────────────────────────┐               ┌─────────────────────────────┐
     │  Stage 2: Preprocessing     │               │  Recapture Advice Generated │
     │  (448x448, Green CLAHE)     │               │  --> ESCALATE TO CLINICIAN  │
     └──────────────┬──────────────┘               └─────────────────────────────┘
                    │
         ┌──────────┴────────────────────────────────┐
         │                                           │
         ▼                                           ▼
┌─────────────────────────────┐             ┌─────────────────────────────┐
│ Stage 3: CNN Grading        │             │ Stage 4: Lesion Evidence    │
│ (ResNet-50 5-Class Scale)   │             │ Track A: Morphological      │
└──────────────┬──────────────┘             │ Track B: Multi-Head U-Net   │
               │                            └──────────────┬──────────────┘
               ├──────────────────────────────┐            │
               ▼                              ▼            │
┌─────────────────────────────┐ ┌────────────────────────┐ │
│ Temperature Scaling         │ │ Grad-CAM Explainability│ │
│ Calibrated P(Referable >=2) │ │ Regional Attention Map │ │
└──────────────┬──────────────┘ └─────────────┬──────────┘ │
               │                              │            │
               └──────────────────┬───────────┴────────────┘
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │ Stage 5: Spatial Agreement  │
                   │ & Safety Decision Policy    │
                   └──────────────┬──────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│    AUTO-CLEAR    │    │      REFER       │    │     ESCALATE     │
│  (P < 0.40 and   │    │  (P >= 0.70 and  │    │ (Disagreement,   │
│ Evidence Agrees) │    │ Evidence Agrees) │    │  PDR 4, Quality) │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## Technical Approach

### Image Quality Assessment
Implemented in `src/+quality/`. Before running inference, images undergo automated quality assessment:
- **Sharpness Metric:** Computed via Tenengrad gradient variance on the green channel.
- **Illumination Uniformity & SNR:** Verifies exposure and field-of-view (FOV) illumination stability.
- **Borderline Enhancement:** Images with borderline illumination undergo Contrast-Limited Adaptive Histogram Equalization (CLAHE) with strict dynamic-range verification.
- **Ungradable Intercept:** Severely degraded or occluded images are immediately escalated with specific recapture advice (e.g., adjust diopter, increase flash, re-center pupil).

### Image Preprocessing
Implemented in `src/+common/preprocess.m`. All images (training, validation, and live inference) share a single preprocessing seam:
- Circular FOV detection and black border cropping.
- Spatial normalization to a minimum resolution of $448 \times 448$ pixels (preserving fine microaneurysm details).
- Local contrast normalization and green-channel dynamic range scaling.

### DR Classification
Implemented in `src/+grade/`.
- Deep convolutional neural network using a transfer-learned **ResNet-50** architecture adapted for 5-class ICDR severity classification.
- Trained using class-balanced focal loss and Adam optimization with learning rate warmup and gradient clipping.

### Lesion Segmentation
Implemented in `src/+segment/`.
- **Track A (Classical Morphological Candidate Detector):** Rule-based filter bank for microaneurysm candidate identification and exudate extraction without requiring training labels.
- **Track B (Multi-Head U-Net):** Deep semantic segmentation network trained on pixel-level lesion annotations (IDRiD Set-A) across 4 heads: Microaneurysms (MA), Haemorrhages (HE), Hard Exudates (EX), and Soft Exudates (SE).
- Evaluated with Focal-Tversky loss ($\alpha=0.3, \beta=0.7$) to penalize missed lesions over false alarms in highly imbalanced pixel regimes.

### Retinal Vessel Segmentation
Implemented in `src/+segment/trainVesselSegmentation.m` and `segmentVessels.m`.
- Dedicated U-Net trained on the DRIVE dataset to extract the retinal vascular tree inside the valid FOV.
- Supports disc-fovea quadrant axis alignment for the International Clinical 4-2-1 grading rule.

### Explainable AI
Implemented in `src/+explain/`.
- **Grad-CAM (Gradient-Weighted Class Activation Mapping):** Computed at the final convolutional layer (`activation_49_relu`) to reveal the receptive regions driving CNN predictions.
- **Spatial Alignment:** Maps Grad-CAM continuous heatmaps and discrete segmented lesion coordinates into a shared coordinate space.

### Decision Support & Safety Policies
Implemented in `src/+grade/decisionPolicy.m` and `src/+grade/icdrRule.m`.
- **Operating Point:** Calibrated threshold $P(\text{Referable}) \ge 0.40$ (frozen).
- **Spatial Agreement Gate:** Checks that Grad-CAM attention overlaps with segmented lesions by at least $25\%$ coverage.
- **Mandatory Level 4 Escalation:** All cases predicted as Proliferative DR (ICDR Level 4) are escalated to an ophthalmologist by rule (`alwaysEscalateLevel4 = true`).

### Report Generation
Implemented in `src/+report/generate.m`.
- Generates multi-panel clinical screening reports containing patient metadata, quality scores, raw vs. calibrated probabilities, Grad-CAM heatmaps, lesion count overlays, and human clinician sign-off blocks.

### Rural Healthcare Simulation
Implemented in `simulink/` (`district_model.slx`, `runDistrictSimulation.m`, `sweep_experiments.m`).
- Discrete-event SimEvents queueing model simulating an entire district screening program (100,000+ eligible diabetic population).
- Evaluates grader queue backlogs, transit delays between rural PHCs and district hospitals, and total specialist clinical hours saved.

---

## Algorithms & Methods

- **ResNet-50**: Deep residual network for robust feature extraction and 5-class disease grading.
- **U-Net**: Encoder-decoder architecture with skip connections for pixel-accurate lesion and vessel segmentation.
- **Grad-CAM**: Gradient-weighted class activation mapping for visual attribution.
- **CLAHE**: Contrast-limited adaptive histogram equalization on the green channel.
- **Temperature Scaling**: Post-hoc parametric Platt scaling on validation logits ($z_i / T$) to achieve calibrated probabilities.
- **Focal-Tversky Loss**: Asymmetric loss optimizing lesion segmentation under extreme class imbalance.
- **Cost-Sensitive Selective Classification**: Autonomous decision policy enforcing the equal-coverage safety veto (ADR-0001).
- **SimEvents Queue Simulation**: District-level healthcare operations research modeling.

---

## Datasets

| Dataset | Primary Role | Contents & Labels |
| :--- | :--- | :--- |
| **APTOS 2019 Blindness Detection** | Primary Classification & Calibration | 3,662 fundus photographs from Indian clinics with 5-class ICDR severity grades. |
| **IDRiD (Indian Diabetic Retinopathy Image Dataset)** | Lesion Segmentation & Localization | 81 fundus images with expert pixel-level masks for MA, HE, EX, SE, optic disc, and fovea centers. |
| **DRIVE (Digital Retinal Images for Vessel Extraction)** | Retinal Vessel Segmentation | 40 standardized retinal images with manual vascular segmentation annotations. |
| **MESSIDOR-2** | Sealed External Validation | Adjudicated external evaluation benchmark; kept under strict cryptographic seal during model development. |

*Note: All development splits (`data/splits/`) are fixed and strictly separated by patient ID to guarantee zero data leakage between train, validation, and calibration sets.*

---

## System Workflow

```
[Camera Capture at PHC] ──> [Quality Check] ──> [Preprocess 448x448]
                                                        │
         ┌──────────────────────────────────────────────┴──────────────────────────────┐
         ▼                                                                             ▼
  [ResNet-50 Grading]                                                           [U-Net Lesion Extractor]
         │                                                                             │
  [Temperature Scaling (T=2.1414)]                                              [Lesion Count & Quadrants]
         │                                                                             │
  [Grad-CAM Attention Map]                                                             │
         │                                                                             │
         └──────────────────────────────┬──────────────────────────────────────────────┘
                                        ▼
                         [Spatial Agreement Analysis]
                                        │
                         [Three-Way Decision Engine]
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
      Auto-Clear                      Refer                       Escalate
   (Healthy Retina)             (Confirmed Disease)          (Ambiguous / Level 4)
           │                            │                            │
           └────────────────────────────┴────────────────────────────┘
                                        ▼
                        [Clinical Multi-Panel Report]
                                        ▼
                      [SimEvents District Queue Model]
```

---

## Installation & Prerequisites

### 1. MATLAB Environment
- **MATLAB Version:** R2022b or later (R2023b / R2024a recommended)
- **Required Toolboxes:**
  - Deep Learning Toolbox
  - Image Processing Toolbox
  - Computer Vision Toolbox
  - Medical Imaging Toolbox
  - Statistics and Machine Learning Toolbox
  - Simulink & SimEvents (for district queue simulation)
  - Parallel Computing Toolbox

### 2. Python Environment (Optional for Web Console)
- Python 3.9+ with standard library (no third-party packages required).

---

## Running the Application

### A. Interactive Web Screening Console (Standalone)
To launch the interactive web application:
```bash
./start.sh web
# Or directly:
python3 web_app/server.py
```
This opens the browser console featuring 12 curated clinical case presets, real-time Grad-CAM overlays, lesion toggles, clinical report exports, and the interactive district healthcare simulator.

### B. MATLAB App Designer GUI
From the terminal:
```bash
./start.sh gui
```
Or inside the MATLAB command window:
```matlab
addpath(genpath('src'));
addpath('app');
app = ScreeningApp;
```

### C. Headless Single-Image Inference Demo
```bash
./start.sh demo
```

### D. Verify Operating Point & Summary Metrics
```bash
./start.sh numbers
```

### E. Run Full Test Suite
```bash
./start.sh tests
# Or in MATLAB:
matlab -batch "assertSuccess(runtests('tests', 'IncludeSubfolders', true))"
```

---

## Model Training

To retrain pipeline models from scratch on your dataset splits:

```bash
# 1. Train 5-class DR Grading Backbone (ResNet-50)
matlab -batch "addpath(genpath('src')); grade.train('config/default.json')"

# 2. Train Multi-Head Lesion Segmentation Network (U-Net on IDRiD)
matlab -batch "addpath(genpath('src')); segment.trainLesionSegmentation('config/default.json')"

# 3. Train Retinal Vessel Segmentation (U-Net on DRIVE)
matlab -batch "addpath(genpath('src')); segment.trainVesselSegmentation('config/default.json')"

# 4. Fit Temperature Scaling on Calibration Split
matlab -batch "addpath(genpath('src')); grade.fitTemperature('results/<run>/epoch_08.mat', 'config/default.json')"
```

---

## Evaluation

```bash
# Evaluate lesion segmentation checkpoint on IDRiD Set-B
matlab -batch "addpath(genpath('src')); addpath(genpath('eval')); lesionSegmentationEvaluation('results/<run>/best_lesion_model.mat')"

# Evaluate vessel segmentation on DRIVE test split
matlab -batch "addpath(genpath('src')); addpath('eval'); vesselSegmentationEvaluation('Split', 'test')"

# Run full ablation study (Configurations A1 through A13)
matlab -batch "addpath(genpath('src')); addpath('eval'); ablationHarness()"

# Run District Simulation Experiments (E1 to E6)
matlab -batch "addpath('simulink'); sweep_experiments()"
```

---

## Experimental Results

### 1. Classification Performance (Frozen Operating Point $P \ge 0.40$)
Evaluated on internal validation split ($n = 550$ patients):

| Metric | Target | Measured Value (95% Wilson CI) |
| :--- | :--- | :--- |
| **Sensitivity (Referable DR $\ge$ Level 2)** | $> 0.90$ | **$0.9821$** ($0.9547 - 0.9931$) |
| **Specificity** | $> 0.85$ | **$0.9174$** ($0.8821 - 0.9428$) |
| **Quadratic Weighted Kappa (QWK)** | $> 0.80$ | **$0.8914$** |
| **Calibrated Temperature ($T$)** | — | **$2.1414$** |

### 2. Lesion Segmentation Performance (IDRiD Set-B, $n = 27$)

| Lesion Type | Precision-Recall AUC (AUPR) | Background Prevalence | Relative Enrichment Factor |
| :--- | :--- | :--- | :--- |
| **Hard Exudates (EX)** | **$0.7550$** | $0.01085$ | **$70\times$ baseline** |
| **Microaneurysms (MA)** | **$0.4340$** | $0.00098$ | **$442\times$ baseline** |
| **Haemorrhages (HE)** | **$0.2060$** | $0.01066$ | **$19\times$ baseline** |
| **Soft Exudates (SE)** | **$0.0980$** | $0.00181$ | **$54\times$ baseline** |

### 3. Key Ablation Findings (A1 vs. A10 vs. A12)
- **A1 (Classifier Only):** 100% coverage, but auto-clears 1 referable patient incorrectly.
- **A10 (Frozen Architecture):** Restricts lesion evidence to the validated hard-exudate head at threshold $0.99$ and applies endpoint comparison. Achieves **32.73% autonomous coverage with zero referable patients sent home**.
- **A12 (Relaxed Spatial Gate):** Raised coverage to 36.0% but sent 2 referable patients home. Rejected under ADR-0001 (Equal-Coverage Safety Veto).

---

## Limitations

1. **Research Prototype:** This software is an academic screening aid and research prototype. It does not constitute a certified medical device and has not received CDSCO / FDA regulatory clearance.
2. **Neovascularization Detection:** Proliferative diabetic retinopathy involves subtle neovascular vessel proliferation (NVD/NVE) for which pixel-level segmentation masks are not available in standard datasets. Level 4 cases are therefore guarded via rule-based escalation.
3. **Generalization to Novel Hardware:** Fundus cameras differ in optical magnification, illumination geometry, and sensor noise. Deployment to new cameras requires local quality calibration.

---

## Future Scope

- **Multi-Modal Integration:** Incorporating Optical Coherence Tomography (OCT) scans and non-mydriatic handheld camera feeds.
- **Longitudinal Progression Tracking:** Registering sequential fundus photographs over multiple annual visits to detect subtle microaneurysm turnover rates.
- **Edge Hardware Deployment:** Quantizing and compiling the ResNet and U-Net backbones for on-device inference on embedded edge accelerators (e.g., NVIDIA Jetson, Raspberry Pi AI Kit).
- **Federated Learning:** Privacy-preserving distributed training across multiple district hospitals in India without centralizing sensitive patient data.

---

## Project Structure

```
.
├── app/                  # MATLAB App Designer desktop interface
│   ├── README.md         # UI documentation
│   └── ScreeningApp.m    # Interactive screening application
├── config/               # Frozen hyperparameters & ablation JSON configs
│   ├── default.json      # Frozen production configuration (A10)
│   └── ablation_A*.json  # Experimental ablation configurations
├── data/                 # Data documentation, split manifests, and sealed storage
│   ├── PROVENANCE.md     # Full dataset audit, checksums, and licensing
│   └── splits/           # Patient-separated CSV split files
├── docs/                 # Architectural Decision Records, research notes, technical design
│   ├── adr/              # ADR 0001 (Safety Veto) & ADR 0002 (Spatial Gate)
│   ├── research/         # Split verification & dataset audits
│   └── WHAT_IT_DOES.md   # Plain-English technical overview
├── eval/                 # Evaluation harnesses, metrics, and case selection
│   ├── metrics/          # Wilson intervals, QWK, AUPR, ROC metrics
│   ├── harness.m         # Core evaluation orchestration
│   └── ablationHarness.m # Ablation study evaluation harness
├── simulink/             # District healthcare SimEvents capacity model
│   ├── district_model.slx# SimEvents queueing network
│   └── sweep_experiments.m# Simulation parameter sweep scripts
├── src/                  # Core MATLAB technical packages
│   ├── +app/             # Orchestration seams
│   ├── +common/          # Shared image preprocessing (448x448)
│   ├── +data/            # Split verification utilities
│   ├── +eval/            # Calibration scoring
│   ├── +explain/         # Grad-CAM and lesion evidence aggregation
│   ├── +grade/           # ResNet-50 grading, temperature scaling, decision policy
│   ├── +quality/         # Image quality gate & CLAHE enhancement
│   ├── +report/          # Automated clinical report generator
│   └── +segment/         # Classical detector & U-Net lesion segmentation
├── tests/                # 26 automated unit and regression test classes
├── web_app/              # Standalone web console & simulator
├── start.sh              # Unified application and demo launcher
└── LICENSE               # MIT License
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
