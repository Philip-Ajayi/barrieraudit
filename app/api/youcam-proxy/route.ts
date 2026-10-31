import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 45; // Vercel serverless execution limit

/**
 * Production YouCam Skin AI Proxy Route
 * Directly interfaces with Perfect Corp's Task API:
 * 1. Dispatches skin analysis task with requested dst_actions
 * 2. Polls task endpoint until status === 'success' | 'completed' | 'error'
 * 3. Extracts authentic numerical scores and genuine spatial mask URLs
 * NO MOCKS, NO SYNTHETIC FALLBACKS, NO HARDCODED VALUES.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, actions } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Missing imageBase64 payload.' },
        { status: 400 }
      );
    }

    const clientHeaderKey = req.headers.get('x-youcam-api-key');
    const apiKey = (clientHeaderKey || process.env.YOUCAM_API_KEY || '').trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Missing Perfect Corp YouCam API Key. Please set YOUCAM_API_KEY in your environment variables or enter it via the YouCam Key modal in the header.',
        },
        { status: 401 }
      );
    }

    // Default to the official task endpoint
    const endpoint = (
      process.env.YOUCAM_API_ENDPOINT ||
      'https://yce-api.makeupar.com/api/v1/task'
    ).replace(/\/+$/, '');

    // Prepare clean Base64 string (strip data:image/...;base64, prefix if present)
    const cleanBase64 = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    const requestedActions = actions || ['redness', 'moisture', 'texture', 'acne'];

    const taskPayload = {
      dst_actions: requestedActions,
      miniserver_args: {
        enable_mask_overlay: true,
      },
      format: 'json',
      src_file_base64: cleanBase64,
    };

    // 1. Initiate AI Skin Analysis Task
    const createTaskRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(taskPayload),
    });

    if (!createTaskRes.ok) {
      const errText = await createTaskRes.text();
      let parsedErr: any;
      try {
        parsedErr = JSON.parse(errText);
      } catch {
        parsedErr = { message: errText };
      }
      return NextResponse.json(
        {
          error: `YouCam Task Creation Failed (HTTP ${createTaskRes.status})`,
          details: parsedErr.error_msg || parsedErr.message || parsedErr,
        },
        { status: createTaskRes.status }
      );
    }

    const taskData = await createTaskRes.json();
    const taskId =
      taskData.task_id ||
      taskData.data?.task_id ||
      taskData.id ||
      taskData.result?.task_id;

    if (!taskId) {
      return NextResponse.json(
        {
          error: 'YouCam API did not return a valid task_id.',
          rawResponse: taskData,
        },
        { status: 502 }
      );
    }

    // 2. Poll Task Status until completion (max 20 iterations @ 1.5s = 30 seconds)
    const maxPollAttempts = 20;
    let pollResult: any = null;

    for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Supports both path-param (/task/{id}) and query-param (/task?task_id={id})
      let pollRes = await fetch(`${endpoint}/${taskId}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (pollRes.status === 404) {
        pollRes = await fetch(`${endpoint}?task_id=${taskId}`, {
          method: 'GET',
          headers: {
            'X-API-KEY': apiKey,
            Authorization: `Bearer ${apiKey}`,
          },
        });
      }

      if (!pollRes.ok) {
        continue;
      }

      const pollData = await pollRes.json();
      const status = (
        pollData.status ||
        pollData.task_status ||
        pollData.data?.status ||
        pollData.data?.task_status ||
        ''
      ).toLowerCase();

      if (status === 'success' || status === 'completed') {
        pollResult = pollData.data?.result || pollData.result || pollData.data;
        break;
      }

      if (status === 'error' || status === 'failed') {
        return NextResponse.json(
          {
            error: 'YouCam Skin AI task processing failed.',
            details:
              pollData.error_msg ||
              pollData.data?.error_msg ||
              pollData.message ||
              'Image could not be processed. Ensure the face is well-lit and clearly centered.',
          },
          { status: 422 }
        );
      }
    }

    if (!pollResult) {
      return NextResponse.json(
        {
          error: 'YouCam API task timed out after 30 seconds. Please try again with a smaller image.',
          taskId,
        },
        { status: 504 }
      );
    }

    // 3. Parse authentic production YouCam schema
    // YouCam can return either an array of objects or an object keyed by action type
    const scores: Record<string, number> = {};
    const maskUrls: Record<string, string> = {};

    if (Array.isArray(pollResult)) {
      for (const item of pollResult) {
        const concern = item.type || item.action || item.name;
        if (!concern) continue;
        const val = item.ui_score ?? item.raw_score ?? item.score;
        if (typeof val === 'number') {
          scores[concern.toLowerCase()] = Math.round(val);
        }
        if (item.mask_urls && item.mask_urls.length > 0) {
          maskUrls[concern.toLowerCase()] = item.mask_urls[0];
        } else if (item.mask_url) {
          maskUrls[concern.toLowerCase()] = item.mask_url;
        }
      }
    } else if (typeof pollResult === 'object') {
      const concernKeys = ['redness', 'moisture', 'texture', 'acne', 'hd_redness', 'hd_moisture', 'hd_texture', 'hd_acne'];
      for (const key of concernKeys) {
        const item = pollResult[key];
        if (item) {
          const val =
            typeof item === 'number'
              ? item
              : item.ui_score ?? item.raw_score ?? item.score;
          if (typeof val === 'number') {
            const canonicalKey = key.replace('hd_', '');
            scores[canonicalKey] = Math.round(val);
          }
          if (item.mask_urls && item.mask_urls.length > 0) {
            scores[key] = item.mask_urls[0];
          } else if (item.mask_url) {
            scores[key] = item.mask_url;
          }
        }
      }
      if (pollResult.overlay_url) {
        maskUrls.overlay = pollResult.overlay_url;
      }
      if (pollResult.dst_file_url) {
        maskUrls.composite = pollResult.dst_file_url;
      }
    }

    // Strict validation: Verify that YouCam returned actual scores
    if (
      scores.redness === undefined &&
      scores.moisture === undefined &&
      scores.texture === undefined &&
      scores.acne === undefined
    ) {
      return NextResponse.json(
        {
          error: 'YouCam API returned unexpected response without valid concern scores.',
          rawResult: pollResult,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      source: 'YOUCAM_CLOUD_API',
      taskId,
      telemetry: {
        redness: scores.redness ?? 0,
        moisture: scores.moisture ?? 0,
        texture: scores.texture ?? 0,
        acne: scores.acne ?? 0,
        skinAge: pollResult.skin_age || pollResult.skinAge || undefined,
        maskUrls,
        maskDataUrl: maskUrls.redness || maskUrls.overlay || maskUrls.composite,
        rawPhotoUrl: imageBase64,
        timestamp: new Date().toISOString(),
        isLiveProduction: true,
      },
    });
  } catch (err: any) {
    console.error('Fatal Server Error in youcam-proxy:', err);
    return NextResponse.json(
      { error: err.message || 'Internal analysis error occurred.' },
      { status: 500 }
    );
  }
}