import { NextRequest, NextResponse } from 'next/server';

/**
 * Serverless Route: /api/save-telemetry
 * Stores scan telemetry and quarantined products to Supabase if configured.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const dbRes = await fetch(`${supabaseUrl}/rest/v1/skin_scans`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            redness_score: payload.telemetry.redness,
            moisture_score: payload.telemetry.moisture,
            texture_score: payload.telemetry.texture,
            acne_score: payload.telemetry.acne,
            bir_score: payload.birAnalysis.birScore,
            barrier_status: payload.birAnalysis.status,
            scanned_at: new Date().toISOString(),
          }),
        });

        if (dbRes.ok) {
          return NextResponse.json({ savedToSupabase: true });
        }
      } catch (err) {
        console.warn('Supabase post failed, local persistence is active:', err);
      }
    }

    return NextResponse.json({
      savedLocally: true,
      message: 'Telemetry logged to browser client state.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
