/**
 * Explainable AI for Diabetic Retinopathy Screening (XAI-DR)
 * Curated Retinal Fundus Screening Case Presets
 * Covers all 12 distinct clinical and algorithmic pipeline behaviors.
 */

const CLINICAL_CASES = [
  {
    id: "case_01",
    name: "Case 1: Healthy Retina (No Diabetic Retinopathy)",
    patientId: "IND-MH-2026-0812",
    age: 48,
    gender: "Female",
    eye: "OD (Right Eye)",
    category: "Auto-Clear",
    description: "Clear fundus with normal optic disc, crisp macula, and no visible microaneurysms or exudates. Classifier and evidence channels both indicate No DR.",
    quality: {
      status: "Gradable",
      sharpness: 88.4,
      illumination: 0.92,
      contrast: 0.85,
      snr: 24.6,
      advice: "Optimal image quality. No recapture needed."
    },
    probabilities: {
      raw: [0.942, 0.041, 0.012, 0.003, 0.002],
      calibrated: [0.915, 0.062, 0.017, 0.004, 0.002]
    },
    predictedGrade: 0,
    calibratedReferableProb: 0.023, // Level >= 2
    gradCAMFocus: { x: 0.52, y: 0.48, radius: 0.18, intensity: 0.65 },
    lesions: {
      hardExudates: [],
      hemorrhages: [],
      microaneurysms: [],
      softExudates: []
    },
    retinaBase: {
      disc: { x: 0.30, y: 0.50, r: 0.10 },
      fovea: { x: 0.62, y: 0.52 },
      vesselColor: "rgba(165, 38, 25, 0.85)",
      bgHue: 18,
      bgSat: 78,
      bgLight: 34
    },
    decision: {
      triage: "AUTO-CLEAR",
      badgeClass: "badge-autoclear",
      reason: "Calibrated referable risk is 2.3% (below 40.0% threshold). Quality gate passed and no lesions detected.",
      spatialAgreement: "N/A (No Lesions)",
      coverageState: "Autonomous Clear (No Human Required)"
    }
  },
  {
    id: "case_02",
    name: "Case 2: Mild Non-Proliferative DR (Isolated Microaneurysms)",
    patientId: "IND-MH-2026-1149",
    age: 54,
    gender: "Male",
    eye: "OS (Left Eye)",
    category: "Auto-Clear",
    description: "Earliest clinical stage. A few tiny isolated microaneurysms in temporal quadrant. Calibrated referable risk (P >= 2) is 18.4%, safely below the 40.0% referral gate.",
    quality: {
      status: "Gradable",
      sharpness: 82.1,
      illumination: 0.88,
      contrast: 0.81,
      snr: 22.8,
      advice: "Good quality fundus photograph."
    },
    probabilities: {
      raw: [0.15, 0.72, 0.11, 0.015, 0.005],
      calibrated: [0.22, 0.596, 0.142, 0.028, 0.014]
    },
    predictedGrade: 1,
    calibratedReferableProb: 0.184,
    gradCAMFocus: { x: 0.68, y: 0.44, radius: 0.22, intensity: 0.78 },
    lesions: {
      hardExudates: [],
      hemorrhages: [],
      microaneurysms: [
        { x: 0.66, y: 0.42, r: 4 },
        { x: 0.71, y: 0.48, r: 3 },
        { x: 0.64, y: 0.51, r: 4 }
      ],
      softExudates: []
    },
    retinaBase: {
      disc: { x: 0.70, y: 0.50, r: 0.10 },
      fovea: { x: 0.38, y: 0.52 },
      vesselColor: "rgba(160, 35, 20, 0.85)",
      bgHue: 16,
      bgSat: 80,
      bgLight: 33
    },
    decision: {
      triage: "AUTO-CLEAR",
      badgeClass: "badge-autoclear",
      reason: "Mild DR detected (ICDR 1). Calibrated referable probability (18.4%) is below referral threshold (40.0%). Annual rescreening scheduled.",
      spatialAgreement: "76.4% Attention Overlap",
      coverageState: "Autonomous Clear (Routine Annual Follow-up)"
    }
  },
  {
    id: "case_03",
    name: "Case 3: Moderate DR (Hard Exudates + Dot Hemorrhages)",
    patientId: "IND-MH-2026-3024",
    age: 62,
    gender: "Female",
    eye: "OD (Right Eye)",
    category: "Refer",
    description: "Classic referable diabetic retinopathy. Rings of lipid hard exudates and multiple flame hemorrhages across superior-temporal quadrant. High spatial agreement.",
    quality: {
      status: "Gradable",
      sharpness: 85.0,
      illumination: 0.90,
      contrast: 0.84,
      snr: 23.5,
      advice: "Good diagnostic clarity."
    },
    probabilities: {
      raw: [0.01, 0.05, 0.81, 0.11, 0.02],
      calibrated: [0.03, 0.08, 0.68, 0.17, 0.04]
    },
    predictedGrade: 2,
    calibratedReferableProb: 0.890,
    gradCAMFocus: { x: 0.58, y: 0.38, radius: 0.28, intensity: 0.92 },
    lesions: {
      hardExudates: [
        { x: 0.55, y: 0.35, r: 7 },
        { x: 0.58, y: 0.33, r: 6 },
        { x: 0.62, y: 0.36, r: 8 },
        { x: 0.53, y: 0.40, r: 5 },
        { x: 0.60, y: 0.42, r: 6 }
      ],
      hemorrhages: [
        { x: 0.48, y: 0.45, r: 10 },
        { x: 0.64, y: 0.48, r: 9 },
        { x: 0.52, y: 0.30, r: 8 }
      ],
      microaneurysms: [
        { x: 0.56, y: 0.39, r: 4 },
        { x: 0.61, y: 0.34, r: 4 },
        { x: 0.50, y: 0.44, r: 3 }
      ],
      softExudates: []
    },
    retinaBase: {
      disc: { x: 0.28, y: 0.50, r: 0.10 },
      fovea: { x: 0.60, y: 0.52 },
      vesselColor: "rgba(155, 30, 20, 0.88)",
      bgHue: 15,
      bgSat: 82,
      bgLight: 32
    },
    decision: {
      triage: "REFER",
      badgeClass: "badge-refer",
      reason: "Calibrated referable risk 89.0% >= 70.0% referral gate. Multiple hard exudates and hemorrhages confirmed by U-Net and Grad-CAM spatial agreement.",
      spatialAgreement: "88.2% Attention Overlap (Strong Agreement)",
      coverageState: "Autonomous Referral (District Eye Clinic Booking)"
    }
  },
  {
    id: "case_04",
    name: "Case 4: Severe Non-Proliferative DR (4-2-1 Rule Met)",
    patientId: "IND-MH-2026-4419",
    age: 67,
    gender: "Male",
    eye: "OD (Right Eye)",
    category: "Refer",
    description: "Extensive intraretinal hemorrhages in all four quadrants with venous beading and cotton wool spots (soft exudates). Immediate specialist attention required.",
    quality: {
      status: "Gradable",
      sharpness: 79.5,
      illumination: 0.84,
      contrast: 0.79,
      snr: 21.4,
      advice: "Adequate for diagnostic triage."
    },
    probabilities: {
      raw: [0.001, 0.009, 0.18, 0.73, 0.08],
      calibrated: [0.005, 0.025, 0.24, 0.61, 0.12]
    },
    predictedGrade: 3,
    calibratedReferableProb: 0.970,
    gradCAMFocus: { x: 0.50, y: 0.50, radius: 0.35, intensity: 0.95 },
    lesions: {
      hardExudates: [
        { x: 0.65, y: 0.40, r: 8 },
        { x: 0.68, y: 0.45, r: 7 }
      ],
      hemorrhages: [
        { x: 0.42, y: 0.32, r: 14 },
        { x: 0.62, y: 0.30, r: 12 },
        { x: 0.40, y: 0.65, r: 15 },
        { x: 0.65, y: 0.68, r: 13 },
        { x: 0.52, y: 0.42, r: 10 }
      ],
      microaneurysms: [
        { x: 0.45, y: 0.35, r: 4 },
        { x: 0.58, y: 0.62, r: 4 }
      ],
      softExudates: [
        { x: 0.38, y: 0.44, r: 12 },
        { x: 0.59, y: 0.55, r: 14 }
      ]
    },
    retinaBase: {
      disc: { x: 0.28, y: 0.50, r: 0.10 },
      fovea: { x: 0.60, y: 0.52 },
      vesselColor: "rgba(145, 25, 15, 0.90)",
      bgHue: 14,
      bgSat: 84,
      bgLight: 30
    },
    decision: {
      triage: "REFER",
      badgeClass: "badge-refer",
      reason: "Severe NPDR (ICDR 3). Calibrated referable probability 97.0%. Multiquadrant hemorrhages and cotton wool spots confirmed.",
      spatialAgreement: "91.5% Attention Overlap",
      coverageState: "Autonomous Referral (Urgent Hospital Referral)"
    }
  },
  {
    id: "case_05",
    name: "Case 5: Proliferative DR (Level 4 - Mandatory Human Escalation)",
    patientId: "IND-MH-2026-5502",
    age: 71,
    gender: "Female",
    eye: "OS (Left Eye)",
    category: "Escalate",
    description: "Neovascularization at the optic disc (NVD) and preretinal hemorrhage. Under policy rule 'alwaysEscalateLevel4', all predicted Level 4 cases MUST be confirmed by a human specialist.",
    quality: {
      status: "Gradable",
      sharpness: 81.2,
      illumination: 0.86,
      contrast: 0.82,
      snr: 22.0,
      advice: "Good image quality."
    },
    probabilities: {
      raw: [0.001, 0.004, 0.045, 0.21, 0.74],
      calibrated: [0.004, 0.016, 0.09, 0.28, 0.61]
    },
    predictedGrade: 4,
    calibratedReferableProb: 0.980,
    gradCAMFocus: { x: 0.68, y: 0.50, radius: 0.30, intensity: 0.96 },
    lesions: {
      hardExudates: [
        { x: 0.45, y: 0.40, r: 6 },
        { x: 0.48, y: 0.42, r: 7 }
      ],
      hemorrhages: [
        { x: 0.65, y: 0.45, r: 22 },
        { x: 0.70, y: 0.55, r: 18 },
        { x: 0.42, y: 0.58, r: 12 }
      ],
      microaneurysms: [{ x: 0.44, y: 0.46, r: 4 }],
      softExudates: [{ x: 0.55, y: 0.48, r: 16 }]
    },
    retinaBase: {
      disc: { x: 0.70, y: 0.50, r: 0.10 },
      fovea: { x: 0.38, y: 0.52 },
      vesselColor: "rgba(140, 20, 10, 0.92)",
      bgHue: 12,
      bgSat: 86,
      bgLight: 28
    },
    decision: {
      triage: "ESCALATE",
      badgeClass: "badge-escalate",
      reason: "Mandatory Safety Rule: System never auto-decides ICDR Level 4 (PDR). Advanced neovascular disease requires direct clinical exam.",
      spatialAgreement: "93.0% Attention Overlap",
      coverageState: "Mandatory Specialist Review (Escalated)"
    }
  },
  {
    id: "case_06",
    name: "Case 6: Poor Quality / Blurred Capture (Quality Gate Intercept)",
    patientId: "IND-MH-2026-6103",
    age: 59,
    gender: "Male",
    eye: "OD (Right Eye)",
    category: "Escalate",
    description: "Severely blurred and under-illuminated image from media opacity/motion. Quality gate halts pipeline before CNN inference to prevent hallucinated diagnoses.",
    quality: {
      status: "Ungradable",
      sharpness: 24.3,
      illumination: 0.38,
      contrast: 0.31,
      snr: 9.8,
      advice: "RECAPTURE REQUIRED: Increase flash intensity, adjust diopter focus, and ask patient to blink before capturing."
    },
    probabilities: {
      raw: [0.20, 0.20, 0.20, 0.20, 0.20],
      calibrated: [0.20, 0.20, 0.20, 0.20, 0.20]
    },
    predictedGrade: null,
    calibratedReferableProb: null,
    gradCAMFocus: { x: 0.50, y: 0.50, radius: 0.10, intensity: 0.0 },
    lesions: {
      hardExudates: [],
      hemorrhages: [],
      microaneurysms: [],
      softExudates: []
    },
    retinaBase: {
      disc: { x: 0.30, y: 0.50, r: 0.10 },
      fovea: { x: 0.62, y: 0.52 },
      vesselColor: "rgba(110, 50, 40, 0.30)",
      bgHue: 20,
      bgSat: 40,
      bgLight: 18,
      blur: 14
    },
    decision: {
      triage: "ESCALATE",
      badgeClass: "badge-escalate",
      reason: "Stopped at Quality Gate: Sharpness score 24.3 < 45.0 threshold. Model inference aborted to preserve diagnostic safety.",
      spatialAgreement: "N/A (Halted at Quality Gate)",
      coverageState: "Operator Recapture Needed (No Model Run)"
    }
  },
  {
    id: "case_07",
    name: "Case 7: Spatial Disagreement (Grad-CAM vs Lesion Mismatch)",
    patientId: "IND-MH-2026-7281",
    age: 60,
    gender: "Female",
    eye: "OS (Left Eye)",
    category: "Escalate",
    description: "Classifier predicted referable disease, but Grad-CAM attention was focused on camera artifact near edge, while lesions were in superior temporal region. Spatial veto triggered.",
    quality: {
      status: "Gradable",
      sharpness: 77.2,
      illumination: 0.82,
      contrast: 0.76,
      snr: 20.9,
      advice: "Adequate image quality."
    },
    probabilities: {
      raw: [0.08, 0.12, 0.65, 0.12, 0.03],
      calibrated: [0.14, 0.18, 0.52, 0.13, 0.03]
    },
    predictedGrade: 2,
    calibratedReferableProb: 0.680,
    gradCAMFocus: { x: 0.18, y: 0.78, radius: 0.20, intensity: 0.88 }, // Mismatched attention!
    lesions: {
      hardExudates: [
        { x: 0.48, y: 0.28, r: 7 },
        { x: 0.52, y: 0.30, r: 6 }
      ],
      hemorrhages: [
        { x: 0.44, y: 0.34, r: 9 }
      ],
      microaneurysms: [],
      softExudates: []
    },
    retinaBase: {
      disc: { x: 0.70, y: 0.50, r: 0.10 },
      fovea: { x: 0.38, y: 0.52 },
      vesselColor: "rgba(160, 35, 20, 0.85)",
      bgHue: 16,
      bgSat: 80,
      bgLight: 33
    },
    decision: {
      triage: "ESCALATE",
      badgeClass: "badge-escalate",
      reason: "ADR-0002 Spatial Veto: Attention heatmap overlap (8.2%) is below the minimum required agreement threshold (25.0%). Case escalated.",
      spatialAgreement: "8.2% Overlap (Disagreement Veto Activated)",
      coverageState: "Safety Escalated to Ophthalmologist"
    }
  },
  {
    id: "case_08",
    name: "Case 8: Borderline Quality -> CLAHE Enhanced & Auto-Cleared",
    patientId: "IND-MH-2026-8094",
    age: 51,
    gender: "Male",
    eye: "OD (Right Eye)",
    category: "Auto-Clear",
    description: "Initial image had slight underexposure (Borderline quality). Adaptive CLAHE enhancement improved vessel contrast, enabling confident clear decision.",
    quality: {
      status: "Enhanced (Borderline Passed)",
      sharpness: 62.4,
      illumination: 0.64,
      contrast: 0.58,
      snr: 17.5,
      advice: "Enhanced via Contrast-Limited Adaptive Histogram Equalization."
    },
    probabilities: {
      raw: [0.89, 0.08, 0.02, 0.007, 0.003],
      calibrated: [0.82, 0.13, 0.035, 0.01, 0.005]
    },
    predictedGrade: 0,
    calibratedReferableProb: 0.050,
    gradCAMFocus: { x: 0.50, y: 0.50, radius: 0.15, intensity: 0.55 },
    lesions: {
      hardExudates: [],
      hemorrhages: [],
      microaneurysms: [],
      softExudates: []
    },
    retinaBase: {
      disc: { x: 0.30, y: 0.50, r: 0.10 },
      fovea: { x: 0.62, y: 0.52 },
      vesselColor: "rgba(150, 35, 25, 0.80)",
      bgHue: 17,
      bgSat: 70,
      bgLight: 26
    },
    decision: {
      triage: "AUTO-CLEAR",
      badgeClass: "badge-autoclear",
      reason: "Enhanced image verified clear. Referable probability 5.0% < 40.0% auto-clear threshold.",
      spatialAgreement: "N/A (No Lesions)",
      coverageState: "Autonomous Clear"
    }
  },
  {
    id: "case_09",
    name: "Case 9: Macular Microaneurysms Near Fovea",
    patientId: "IND-MH-2026-9118",
    age: 58,
    gender: "Female",
    eye: "OS (Left Eye)",
    category: "Refer",
    description: "Clustered microaneurysms within 1 disc diameter of foveal avascular zone (FAZ). High risk of macular edema.",
    quality: {
      status: "Gradable",
      sharpness: 83.7,
      illumination: 0.87,
      contrast: 0.80,
      snr: 22.4,
      advice: "Good resolution."
    },
    probabilities: {
      raw: [0.03, 0.14, 0.74, 0.07, 0.02],
      calibrated: [0.07, 0.18, 0.62, 0.10, 0.03]
    },
    predictedGrade: 2,
    calibratedReferableProb: 0.750,
    gradCAMFocus: { x: 0.40, y: 0.52, radius: 0.22, intensity: 0.89 },
    lesions: {
      hardExudates: [{ x: 0.44, y: 0.49, r: 5 }],
      hemorrhages: [{ x: 0.36, y: 0.54, r: 7 }],
      microaneurysms: [
        { x: 0.39, y: 0.50, r: 4 },
        { x: 0.42, y: 0.53, r: 4 },
        { x: 0.37, y: 0.48, r: 3 }
      ],
      softExudates: []
    },
    retinaBase: {
      disc: { x: 0.70, y: 0.50, r: 0.10 },
      fovea: { x: 0.38, y: 0.52 },
      vesselColor: "rgba(160, 35, 20, 0.85)",
      bgHue: 16,
      bgSat: 80,
      bgLight: 33
    },
    decision: {
      triage: "REFER",
      badgeClass: "badge-refer",
      reason: "Referable DR (75.0% probability). Macular microaneurysms and exudate detected.",
      spatialAgreement: "84.7% Attention Overlap",
      coverageState: "Autonomous Referral"
    }
  },
  {
    id: "case_10",
    name: "Case 10: Clinically Significant Macular Edema (CSME)",
    patientId: "IND-MH-2026-1044",
    age: 64,
    gender: "Male",
    eye: "OD (Right Eye)",
    category: "Refer",
    description: "Prominent hard exudate circinate ring centered on the macula with foveal involvement. Urgent anti-VEGF / laser evaluation needed.",
    quality: {
      status: "Gradable",
      sharpness: 86.1,
      illumination: 0.91,
      contrast: 0.86,
      snr: 24.0,
      advice: "Excellent quality."
    },
    probabilities: {
      raw: [0.005, 0.025, 0.85, 0.10, 0.02],
      calibrated: [0.015, 0.055, 0.76, 0.14, 0.03]
    },
    predictedGrade: 2,
    calibratedReferableProb: 0.930,
    gradCAMFocus: { x: 0.60, y: 0.50, radius: 0.26, intensity: 0.94 },
    lesions: {
      hardExudates: [
        { x: 0.57, y: 0.46, r: 8 },
        { x: 0.63, y: 0.47, r: 9 },
        { x: 0.65, y: 0.53, r: 8 },
        { x: 0.59, y: 0.56, r: 7 },
        { x: 0.55, y: 0.51, r: 8 }
      ],
      hemorrhages: [{ x: 0.52, y: 0.44, r: 8 }],
      microaneurysms: [{ x: 0.61, y: 0.49, r: 4 }],
      softExudates: []
    },
    retinaBase: {
      disc: { x: 0.28, y: 0.50, r: 0.10 },
      fovea: { x: 0.60, y: 0.52 },
      vesselColor: "rgba(155, 30, 20, 0.88)",
      bgHue: 15,
      bgSat: 82,
      bgLight: 32
    },
    decision: {
      triage: "REFER",
      badgeClass: "badge-refer",
      reason: "Referable DR (93.0%). Circinate lipid exudates directly threatening visual acuity.",
      spatialAgreement: "92.4% Attention Overlap",
      coverageState: "Autonomous Referral (Macula Priority)"
    }
  },
  {
    id: "case_11",
    name: "Case 11: Classifier Indeterminate Zone (P = 0.44)",
    patientId: "IND-MH-2026-1122",
    age: 57,
    gender: "Female",
    eye: "OS (Left Eye)",
    category: "Escalate",
    description: "Calibrated probability falls right in the borderline region (0.40 <= P < 0.70). System safely defers to human ophthalmologist rather than guessing.",
    quality: {
      status: "Gradable",
      sharpness: 78.9,
      illumination: 0.83,
      contrast: 0.77,
      snr: 21.0,
      advice: "Good clarity."
    },
    probabilities: {
      raw: [0.18, 0.42, 0.35, 0.04, 0.01],
      calibrated: [0.26, 0.30, 0.37, 0.05, 0.02]
    },
    predictedGrade: 2,
    calibratedReferableProb: 0.440,
    gradCAMFocus: { x: 0.48, y: 0.46, radius: 0.20, intensity: 0.72 },
    lesions: {
      hardExudates: [],
      hemorrhages: [{ x: 0.46, y: 0.44, r: 7 }],
      microaneurysms: [{ x: 0.50, y: 0.48, r: 4 }],
      softExudates: []
    },
    retinaBase: {
      disc: { x: 0.70, y: 0.50, r: 0.10 },
      fovea: { x: 0.38, y: 0.52 },
      vesselColor: "rgba(160, 35, 20, 0.85)",
      bgHue: 16,
      bgSat: 80,
      bgLight: 33
    },
    decision: {
      triage: "ESCALATE",
      badgeClass: "badge-escalate",
      reason: "Uncertainty Deferral: Calibrated referable probability (44.0%) falls in the unconfident band (40.0% to 70.0%). Escalated to clinician.",
      spatialAgreement: "68.2% Attention Overlap",
      coverageState: "Clinician Deferral (Zero-Guessing Safety Policy)"
    }
  },
  {
    id: "case_12",
    name: "Case 12: Peripheral Exudate with Low CNN Weight",
    patientId: "IND-MH-2026-1205",
    age: 63,
    gender: "Male",
    eye: "OD (Right Eye)",
    category: "Escalate",
    description: "Hard exudate detected by U-Net segmentation near superior periphery, but classifier had minimal attention. Disagreement policy triggers human review.",
    quality: {
      status: "Gradable",
      sharpness: 80.4,
      illumination: 0.85,
      contrast: 0.81,
      snr: 21.8,
      advice: "Good diagnostic image."
    },
    probabilities: {
      raw: [0.45, 0.35, 0.16, 0.03, 0.01],
      calibrated: [0.48, 0.32, 0.15, 0.03, 0.02]
    },
    predictedGrade: 0,
    calibratedReferableProb: 0.200,
    gradCAMFocus: { x: 0.45, y: 0.55, radius: 0.18, intensity: 0.60 },
    lesions: {
      hardExudates: [
        { x: 0.68, y: 0.22, r: 7 },
        { x: 0.72, y: 0.25, r: 6 }
      ],
      hemorrhages: [],
      microaneurysms: [],
      softExudates: []
    },
    retinaBase: {
      disc: { x: 0.28, y: 0.50, r: 0.10 },
      fovea: { x: 0.60, y: 0.52 },
      vesselColor: "rgba(155, 30, 20, 0.88)",
      bgHue: 15,
      bgSat: 82,
      bgLight: 32
    },
    decision: {
      triage: "ESCALATE",
      badgeClass: "badge-escalate",
      reason: "Evidence Disagreement: U-Net detected hard exudates in superior periphery that CNN grading head did not register. Safeguard escalation triggered.",
      spatialAgreement: "12.0% Attention Overlap (Under-Threshold)",
      coverageState: "Safety Escalated to Human Grader"
    }
  }
];

window.CLINICAL_CASES = CLINICAL_CASES;
