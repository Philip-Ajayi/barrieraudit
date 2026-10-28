import { SkinTelemetry } from './types';
import { getUserApiKey } from './storage';

export interface AnalysisResponse {
  success: boolean;
  telemetry: SkinTelemetry;
  source: 'YOUCAM_CLOUD_API' | 'LOCAL_CLINICAL_CV_FALLBACK';
  message?: string;
}

/**
 * Sends image data to /api/youcam-proxy.
 * If user has supplied their own API key via interface modal, it sends it in headers.
 */
export async function analyzeSkinPhoto(imageDataUrl: string): Promise<AnalysisResponse> {
  const userKey = getUserApiKey();

  const response = await fetch('/api/youcam-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(userKey ? { 'x-youcam-api-key': userKey } : {})
    },
    body: JSON.stringify({
      imageBase64: imageDataUrl,
      actions: ['redness', 'moisture', 'texture', 'acne']
    })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Proxy responded with HTTP ${response.status}`);
  }

  return await response.json();
}
