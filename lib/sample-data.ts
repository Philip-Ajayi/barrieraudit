import { CasePreset } from './types';

export const CASE_PRESETS: CasePreset[] = [
  {
    id: "case-collapse",
    title: "Case 1: Acid Burn / Over-Actives Collapse",
    description: "Multi-step skin cycler who stacked 30% AHA peel + 1% Retinol. Extreme stinging, burning, diffuse cheek erythema.",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=688&q=80",
    telemetry: {
      redness: 82,
      moisture: 18,
      texture: 66,
      acne: 12,
      skinAge: 27,
      timestamp: new Date().toISOString()
    },
    sampleShelf: [
      {
        name: "AHA 30% + BHA 2% Peeling Solution",
        brand: "The Ordinary",
        rawText: "AHA 30% BHA 2% Peeling Solution Glycolic Acid Lactic Acid Tartaric Acid Salicylic Acid",
        detectedActives: [
          {
            inciName: "Glycolic Acid (AHA)",
            category: "AHA",
            hazardLevel: "SEVERE_EXFOLIANT",
            contraindicatedInCollapse: true,
            notes: "High concentration peeling acid"
          },
          {
            inciName: "Salicylic Acid (BHA)",
            category: "BHA",
            hazardLevel: "POTENT_ACTIVE",
            contraindicatedInCollapse: true,
            notes: "Keratolytic BHA"
          }
        ],
        overallHazard: "SEVERE_EXFOLIANT",
        isQuarantined: true,
        quarantineDaysRemaining: 7
      },
      {
        name: "1% Retinol in Squalane",
        brand: "The Ordinary",
        rawText: "Retinol 1% Squalane Caprylic/Capric Triglyceride",
        detectedActives: [
          {
            inciName: "Retinol / Retinoid Derivative",
            category: "RETINOID",
            hazardLevel: "POTENT_ACTIVE",
            contraindicatedInCollapse: true,
            notes: "High strength retinol"
          }
        ],
        overallHazard: "POTENT_ACTIVE",
        isQuarantined: true,
        quarantineDaysRemaining: 7
      },
      {
        name: "Daily Ceramide Moisturizing Cream",
        brand: "CeraVe",
        rawText: "Ceramide NP Ceramide AP Ceramide EOP Phytosphingosine Cholesterol Glycerin",
        detectedActives: [
          {
            inciName: "Lipid Matrix Booster (Ceramides / Squalane / Panthenol)",
            category: "SOOTHING_LIPID",
            hazardLevel: "SAFE_HYDRATING",
            contraindicatedInCollapse: false,
            notes: "Essential physiological ceramide complex"
          }
        ],
        overallHazard: "SAFE_HYDRATING",
        isQuarantined: false,
        quarantineDaysRemaining: 0
      }
    ]
  },
  {
    id: "case-acne",
    title: "Case 2: True Bacterial Acne (Intact Barrier)",
    description: "Normal hydration, concentrated follicular papules/comedones. Barrier is intact (BIR > 1.2). Anti-acne wash is safe.",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=687&q=80",
    telemetry: {
      redness: 28,
      moisture: 74,
      texture: 48,
      acne: 84,
      skinAge: 22,
      timestamp: new Date().toISOString()
    },
    sampleShelf: [
      {
        name: "2% Salicylic Acid Acne Wash",
        brand: "Neutrogena",
        rawText: "Active Ingredient: Salicylic Acid 2% Water Sodium Laureth Sulfate Cocamidopropyl Betaine",
        detectedActives: [
          {
            inciName: "Salicylic Acid (BHA)",
            category: "BHA",
            hazardLevel: "POTENT_ACTIVE",
            contraindicatedInCollapse: true,
            notes: "Pore-clearing BHA wash"
          }
        ],
        overallHazard: "POTENT_ACTIVE",
        isQuarantined: false,
        quarantineDaysRemaining: 0
      },
      {
        name: "10% Benzoyl Peroxide Spot Treatment",
        brand: "Clean & Clear",
        rawText: "Benzoyl Peroxide 10% Carbomer Disodium EDTA",
        detectedActives: [
          {
            inciName: "Benzoyl Peroxide",
            category: "BENZOYL_PEROXIDE",
            hazardLevel: "SEVERE_EXFOLIANT",
            contraindicatedInCollapse: true,
            notes: "Bactericidal anti-microbial"
          }
        ],
        overallHazard: "SEVERE_EXFOLIANT",
        isQuarantined: false,
        quarantineDaysRemaining: 0
      }
    ]
  },
  {
    id: "case-recovered",
    title: "Case 3: Day 5 Post-Quarantine Re-Check",
    description: "After 5 days of lipid stanching: Redness slashed, moisture restored, quarantine locks releasing gently.",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=764&q=80",
    telemetry: {
      redness: 31,
      moisture: 72,
      texture: 29,
      acne: 18,
      skinAge: 24,
      timestamp: new Date().toISOString()
    },
    sampleShelf: [
      {
        name: "1% Retinol in Squalane",
        brand: "The Ordinary",
        rawText: "Retinol 1% Squalane",
        detectedActives: [
          {
            inciName: "Retinol / Retinoid Derivative",
            category: "RETINOID",
            hazardLevel: "POTENT_ACTIVE",
            contraindicatedInCollapse: true,
            notes: "Ready for buffered once-weekly re-entry"
          }
        ],
        overallHazard: "POTENT_ACTIVE",
        isQuarantined: false,
        quarantineDaysRemaining: 0
      }
    ]
  }
];

export const DEMO_BOTTLE_PRESETS = [
  {
    name: "AHA 30% + BHA 2% Peeling Solution",
    text: "THE ORDINARY AHA 30% + BHA 2% PEELING SOLUTION GLYCOLIC ACID LACTIC ACID SALICYLIC ACID 30ML"
  },
  {
    name: "0.05% Tretinoin Cream",
    text: "TRETINOIN CREAM USP 0.05% RETINOIC ACID TOPICAL FORMULATION RX ONLY DERMATOLOGICAL"
  },
  {
    name: "2% BHA Liquid Exfoliant",
    text: "PAULA'S CHOICE SKIN PERFECTING 2% BHA LIQUID EXFOLIANT SALICYLIC ACID GREEN TEA"
  },
  {
    name: "Barrier Restoring Cream (Lipids)",
    text: "CERAVE MOISTURIZING LOTION CERAMIDE NP CERAMIDE AP CERAMIDE EOP CHOLESTEROL HYALURONIC ACID"
  }
];
