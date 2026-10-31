export type BarrierStatus = 'OPTIMAL' | 'STRESSED' | 'CRITICAL_BARRIER_COLLAPSE';

export type HazardLevel = 'SAFE_HYDRATING' | 'MILD_ACTIVE' | 'POTENT_ACTIVE' | 'SEVERE_EXFOLIANT';

export interface SkinTelemetry {
  redness: number;    // 0 - 100
  moisture: number;   // 0 - 100
  texture: number;    // 0 - 100
  acne: number;       // 0 - 100
  skinAge?: number;
  maskUrls?: {
    redness?: string;
    moisture?: string;
    texture?: string;
    acne?: string;
    overlay?: string;
    composite?: string;
    [key: string]: string | undefined;
  };
  maskDataUrl?: string; // Active spatial mask or overlay URL
  rawPhotoUrl?: string;
  timestamp: string;
  isLiveProduction?: boolean;
  taskId?: string;
}

export interface DetectedActive {
  inciName: string;
  category: 'AHA' | 'BHA' | 'RETINOID' | 'ASCORBIC_ACID' | 'BENZOYL_PEROXIDE' | 'PHYSICAL_SCRUB' | 'SOOTHING_LIPID';
  hazardLevel: HazardLevel;
  estimatedPh?: number;
  contraindicatedInCollapse: boolean;
  notes: string;
}

export interface ShelfProduct {
  id: string;
  name: string;
  brand?: string;
  rawText?: string;
  detectedActives: DetectedActive[];
  overallHazard: HazardLevel;
  isQuarantined: boolean;
  quarantineDaysRemaining: number;
  scannedAt: string;
  source?: 'CAMERA_OCR' | 'UPLOAD_OCR' | 'MANUAL_INCI' | 'BENCHMARK_PRESET';
}

export interface BIRAnalysis {
  birScore: number;
  status: BarrierStatus;
  primaryDiagnosis: 'ACTIVE_INDUCED_BARRIER_BREAKDOWN' | 'BACTERIAL_ACNE_VULGARIS' | 'HOMEOSTATIC_HEALTHY';
  clinicalSummary: string;
  recommendedQuarantineDays: number;
  formulaEvidence: {
    moistureVal: number;
    rednessDenominator: number;
    textureMultiplier: number;
  };
}

export interface StepDownDay {
  day: number;
  phase: string;
  amSteps: string[];
  pmSteps: string[];
  restrictedActives: string[];
  rationale: string;
}

export interface CasePreset {
  id: string;
  title: string;
  description: string;
  photoUrl: string;
  telemetry: SkinTelemetry;
  sampleShelf: Omit<ShelfProduct, 'id' | 'scannedAt'>[];
}