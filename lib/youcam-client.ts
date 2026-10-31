import { SkinTelemetry } from './types';
import { getUserApiKey } from './storage';

export interface AnalysisResponse {
  success: boolean;
  telemetry: SkinTelemetry;
  source: 'YOUCAM_CLOUD_API';
  taskId?: string;
  message?: string;
}

/**
 * Sends image data to /api/youcam-proxy.
 * Enforces production validation: returns genuine YouCam telemetry or throws genuine API error.
 */
export async function analyzeSkinPhoto(imageDataUrl: string): Promise<AnalysisResponse> {
  const userKey = getUserApiKey();

  const response = await fetch('/api/youcam-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(userKey ? { 'x-youcam-api-key': userKey } : {}),
    },
    body: JSON.stringify({
      imageBase64: imageDataUrl,
      actions: ['redness', 'moisture', 'texture', 'acne'],
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.details
      ? `${data.error}: ${typeof data.details === 'object' ? JSON.stringify(data.details) : data.details}`
      : data.error || `YouCam API request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}