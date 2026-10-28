import { DetectedActive, HazardLevel, ShelfProduct } from './types';

interface ActivesRule {
  pattern: RegExp;
  inciName: string;
  category: DetectedActive['category'];
  hazardLevel: HazardLevel;
  contraindicated: boolean;
  notes: string;
}

const INCI_KNOWLEDGE_BASE: ActivesRule[] = [
  // Retinoids
  {
    pattern: /\b(tretinoin|retin-a|all-trans-retinoic)\b/i,
    inciName: "Tretinoin (Retinoic Acid)",
    category: "RETINOID",
    hazardLevel: "SEVERE_EXFOLIANT",
    contraindicated: true,
    notes: "High prescription turnover rate. Severe cell detachment during barrier compromise."
  },
  {
    pattern: /\b(retinol|retinyl palmitate|hydroxypinacolone retinoate|granactive retinoid)\b/i,
    inciName: "Retinol / Retinoid Derivative",
    category: "RETINOID",
    hazardLevel: "POTENT_ACTIVE",
    contraindicated: true,
    notes: "Inhibits immediate stratum corneum barrier repair; induces micro-flaking."
  },
  {
    pattern: /\b(adapalene|differin)\b/i,
    inciName: "Adapalene",
    category: "RETINOID",
    hazardLevel: "SEVERE_EXFOLIANT",
    contraindicated: true,
    notes: "Synthetic retinoid. Prohibits barrier lipid matrix replenishment."
  },

  // AHAs
  {
    pattern: /\b(glycolic acid|glycolate)\b/i,
    inciName: "Glycolic Acid (AHA)",
    category: "AHA",
    hazardLevel: "SEVERE_EXFOLIANT",
    contraindicated: true,
    notes: "Smallest molecular AHA; deep stratum corneum acid penetration, causes stinging and denaturing."
  },
  {
    pattern: /\b(lactic acid)\b/i,
    inciName: "Lactic Acid (AHA)",
    category: "AHA",
    hazardLevel: "POTENT_ACTIVE",
    contraindicated: true,
    notes: "Mildly humectant AHA, but keratolytic pH (<3.8) prevents desmosome recovery."
  },
  {
    pattern: /\b(mandelic acid|malic acid|tartaric acid)\b/i,
    inciName: "Mandelic / Tartaric Acid (AHA)",
    category: "AHA",
    hazardLevel: "POTENT_ACTIVE",
    contraindicated: true,
    notes: "Exfoliating carboxylic acid. High risk of chemical erythema amplification."
  },

  // BHAs
  {
    pattern: /\b(salicylic acid|salicylate|betaine salicylate)\b/i,
    inciName: "Salicylic Acid (BHA)",
    category: "BHA",
    hazardLevel: "POTENT_ACTIVE",
    contraindicated: true,
    notes: "Lipophilic kerato-dissolving agent. Strips sebum and inter-cellular ceramides."
  },

  // Vitamin C
  {
    pattern: /\b(l-ascorbic acid|ascorbic acid|ethylated ascorbic acid)\b/i,
    inciName: "Pure L-Ascorbic Acid",
    category: "ASCORBIC_ACID",
    hazardLevel: "POTENT_ACTIVE",
    contraindicated: true,
    notes: "Requires low pH (2.8 - 3.5) for penetration; creates acute stinging on damaged nerves."
  },

  // Benzoyl Peroxide
  {
    pattern: /\b(benzoyl peroxide|bpo)\b/i,
    inciName: "Benzoyl Peroxide",
    category: "BENZOYL_PEROXIDE",
    hazardLevel: "SEVERE_EXFOLIANT",
    contraindicated: true,
    notes: "Free-radical oxidizer. Dramatically escalates trans-epidermal water loss (TEWL)."
  },

  // Physical Exfoliants
  {
    pattern: /\b(walnut shell|micro-bead|pumice|jojoba esters scrub)\b/i,
    inciName: "Physical Micro-Abrasive Scrub",
    category: "PHYSICAL_SCRUB",
    hazardLevel: "SEVERE_EXFOLIANT",
    contraindicated: true,
    notes: "Causes mechanical micro-fissuring across inflamed stratum granulosum."
  },

  // Soothing Lipids
  {
    pattern: /\b(ceramide np|ceramide ap|ceramide eop|phytosphingosine|cholesterol|squalane|centella asiatica|panthenol|allantoin|madecassoside|bifida ferment)\b/i,
    inciName: "Lipid Matrix Booster (Ceramides / Squalane / Panthenol)",
    category: "SOOTHING_LIPID",
    hazardLevel: "SAFE_HYDRATING",
    contraindicated: false,
    notes: "Essential physiological building block. Accelerates stratum corneum re-epithelialization."
  }
];

export function parseIngredientsText(rawText: string): DetectedActive[] {
  const matches: DetectedActive[] = [];
  const normalized = rawText.toLowerCase();

  for (const rule of INCI_KNOWLEDGE_BASE) {
    if (rule.pattern.test(normalized)) {
      // avoid duplicates
      if (!matches.some(m => m.inciName === rule.inciName)) {
        matches.push({
          inciName: rule.inciName,
          category: rule.category,
          hazardLevel: rule.hazardLevel,
          contraindicatedInCollapse: rule.contraindicated,
          notes: rule.notes
        });
      }
    }
  }

  return matches;
}

export function determineProductHazard(actives: DetectedActive[]): HazardLevel {
  if (actives.some(a => a.hazardLevel === 'SEVERE_EXFOLIANT')) {
    return 'SEVERE_EXFOLIANT';
  }
  if (actives.some(a => a.hazardLevel === 'POTENT_ACTIVE')) {
    return 'POTENT_ACTIVE';
  }
  if (actives.some(a => a.hazardLevel === 'MILD_ACTIVE')) {
    return 'MILD_ACTIVE';
  }
  return 'SAFE_HYDRATING';
}

export function evaluateQuarantineRequirement(
  actives: DetectedActive[],
  isBarrierCollapsed: boolean
): { shouldQuarantine: boolean; quarantineDays: number } {
  if (!isBarrierCollapsed) {
    return { shouldQuarantine: false, quarantineDays: 0 };
  }

  const hasHighRiskActives = actives.some(a => a.contraindicatedInCollapse);
  if (hasHighRiskActives) {
    const isSevere = actives.some(a => a.hazardLevel === 'SEVERE_EXFOLIANT');
    return {
      shouldQuarantine: true,
      quarantineDays: isSevere ? 7 : 5
    };
  }

  return { shouldQuarantine: false, quarantineDays: 0 };
}
