import { BIRAnalysis, SkinTelemetry, StepDownDay } from './types';

/**
 * Calculates the Barrier Integrity Ratio (BIR):
 * BIR = Moisture / (max(Redness, 1) * (1 + 0.5 * (Texture / 100)))
 *
 * Clinical Thresholds:
 * - BIR < 0.60 AND Redness > 50  => CRITICAL_BARRIER_COLLAPSE
 * - BIR between 0.60 and 1.10   => STRESSED
 * - BIR >= 1.10                 => OPTIMAL
 */
export function calculateBIR(telemetry: SkinTelemetry): BIRAnalysis {
  const moisture = Math.max(0, Math.min(100, telemetry.moisture));
  const redness = Math.max(0, Math.min(100, telemetry.redness));
  const texture = Math.max(0, Math.min(100, telemetry.texture));
  const acne = Math.max(0, Math.min(100, telemetry.acne));

  const rednessDenominator = Math.max(redness, 1);
  const textureMultiplier = 1 + 0.5 * (texture / 100);

  const rawBir = moisture / (rednessDenominator * textureMultiplier);
  const birScore = parseFloat(rawBir.toFixed(2));

  let status: BIRAnalysis['status'] = 'OPTIMAL';
  let primaryDiagnosis: BIRAnalysis['primaryDiagnosis'] = 'HOMEOSTATIC_HEALTHY';
  let clinicalSummary = '';
  let recommendedQuarantineDays = 0;

  // Differentiate Barrier Damage vs. Acne Breakout
  if (birScore < 0.60 && redness > 50) {
    status = 'CRITICAL_BARRIER_COLLAPSE';
    primaryDiagnosis = 'ACTIVE_INDUCED_BARRIER_BREAKDOWN';
    recommendedQuarantineDays = 7;
    clinicalSummary =
      `CRITICAL ALERT: Stratum corneum lipid dissociation detected. High diffuse erythema (${redness}) ` +
      `coupled with severe hydration deficit (${moisture}) indicates micro-fissuring rather than follicular acne. ` +
      `Applying acne washes (salicylic acid / benzoyl peroxide) will aggravate contact dermatitis. Immediate active quarantine enforced.`;
  } else if (acne > 65 && redness < 45 && birScore >= 1.0) {
    status = 'OPTIMAL';
    primaryDiagnosis = 'BACTERIAL_ACNE_VULGARIS';
    recommendedQuarantineDays = 0;
    clinicalSummary =
      `TRUE ACNE DETECTED: Localized papulopustular lesions (${acne}) present with robust underlying hydration (${moisture}) ` +
      `and minimal diffuse erythema (${redness}). Stratum corneum integrity remains competent (BIR: ${birScore}). Anti-bacterial treatments permitted.`;
  } else if (birScore < 1.10 || redness > 40) {
    status = 'STRESSED';
    primaryDiagnosis = 'ACTIVE_INDUCED_BARRIER_BREAKDOWN';
    recommendedQuarantineDays = 4;
    clinicalSummary =
      `BARRIER UNDER RESORPTION STRESS: Elevated trans-epidermal sensitivity detected (BIR: ${birScore}). ` +
      `Reduce frequency of high-strength exfoliants and step up humectant occlusives.`;
  } else {
    status = 'OPTIMAL';
    primaryDiagnosis = 'HOMEOSTATIC_HEALTHY';
    recommendedQuarantineDays = 0;
    clinicalSummary =
      `EQUILIBRIUM MAINTAINED: Balanced barrier ratio (${birScore}). Hydration levels buffering micro-texture. Full regimen cleared.`;
  }

  return {
    birScore,
    status,
    primaryDiagnosis,
    clinicalSummary,
    recommendedQuarantineDays,
    formulaEvidence: {
      moistureVal: moisture,
      rednessDenominator,
      textureMultiplier: parseFloat(textureMultiplier.toFixed(3))
    }
  };
}

export const RECOVERY_PROTOCOL: StepDownDay[] = [
  {
    day: 1,
    phase: "Phase 1: Emergency Thermal & Lipid Stanching",
    amSteps: [
      "Lukewarm / cool water splash only (Zero surfactant foaming cleansers)",
      "Pure high-molecular Hyaluronic Acid or Glycerin mist onto damp skin",
      "Physiological 3:1:1 Ceramide-Dominant barrier cream + 2 drops pure Squalane",
      "Mineral Zinc Oxide SPF 50 (Mineral filters soothe heat; chemical filters restricted)"
    ],
    pmSteps: [
      "Ultra-gentle non-foaming cleansing lotion (No double oil cleanse)",
      "Colloidal Oat / Centella Asiatica calming serum",
      "Generous layer of Ceramide Complex ointment or Petrolatum slugging on raw areas"
    ],
    restrictedActives: ["Retinol", "Tretinoin", "Glycolic Acid", "Salicylic Acid", "L-Ascorbic Acid", "Benzoyl Peroxide"],
    rationale: "Cutaneous nerve fibers are exposed due to intercellular lipid depletion. Absolute cessation of low pH and keratolytics."
  },
  {
    day: 2,
    phase: "Phase 1: Quenching Cutaneous Flushing",
    amSteps: [
      "Cool water rinse",
      "Panthenol (Vitamin B5 5%) soothing lotion",
      "Barrier repair cream with Ceramide NP/AP/EOP",
      "Broad spectrum mineral sunscreen"
    ],
    pmSteps: [
      "Gentle milk cleanser",
      "Centella Asiatica / Madecassoside essence",
      "Occlusive lipid balm"
    ],
    restrictedActives: ["All chemical exfoliants", "Scrubs", "Astringents", "Essential oils"],
    rationale: "Reduces vasodilatory erythema and down-regulates pro-inflammatory cytokines."
  },
  {
    day: 3,
    phase: "Phase 2: Desmosome Stabilization",
    amSteps: [
      "Gentle hydrating cleanser",
      "Multi-molecular humectant serum",
      "Niacinamide (MAX 2% - avoid high 10% serums)",
      "Daily lightweight ceramide moisturizer + SPF 30+"
    ],
    pmSteps: [
      "Gentle cleanser",
      "Bifida / Galactomyces probiotic ferment to stabilize acid mantle micro-biome",
      "Barrier balm with Squalane"
    ],
    restrictedActives: ["Peeling solutions", "AHA toners", "Direct retinoids"],
    rationale: "Stabilizing the stratum granulosum and rebuilding cornified envelopes."
  },
  {
    day: 5,
    phase: "Phase 3: Re-Scan Verification Gate",
    amSteps: [
      "Hydrating gentle cleanser",
      "Antioxidant serum (Gentle non-acid, e.g. Ectoin or Resveratrol)",
      "Ceramide barrier cream + SPF 50"
    ],
    pmSteps: [
      "Double cleanse with squalane cleanser",
      "Restorative peptide moisture cream"
    ],
    restrictedActives: ["High strength acids (>5% Glycolic, 2% BHA)"],
    rationale: "Re-scan required via BarrierAudit. Quarantine unlock requires Redness < 35 and BIR > 1.0."
  },
  {
    day: 7,
    phase: "Phase 4: Controlled Active Re-Entry",
    amSteps: [
      "Normal mild routine",
      "Introduce 1 active at 1x weekly frequency with buffering"
    ],
    pmSteps: [
      "Buffering technique: Moisturizer applied BEFORE mild active to slow penetration rate"
    ],
    restrictedActives: ["Daily multi-acid stacking"],
    rationale: "Prevents immediate re-collapse through staggered 'skin cycling' rotation."
  }
];
