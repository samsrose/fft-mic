import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { CreateSnapshotInput, DbSnapshot } from "@/types/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    let rows;
    if (sessionId) {
      rows = await sql`
        SELECT * FROM snapshots WHERE session_id = ${sessionId} ORDER BY created_at DESC
      `;
    } else {
      rows = await sql`SELECT * FROM snapshots ORDER BY created_at DESC LIMIT 100`;
    }

    return NextResponse.json(rows as DbSnapshot[]);
  } catch (error) {
    console.error("Failed to fetch snapshots:", error);
    return NextResponse.json({ error: "Failed to fetch snapshots" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateSnapshotInput = await request.json();

    const rows = await sql`
      INSERT INTO snapshots (
        session_id, name, fft_size, window_function, sample_rate,
        frequency_bins, magnitude_db_summary,
        peak_frequency, peak_magnitude_db, rms_db, spectral_centroid
      ) VALUES (
        ${body.session_id ?? null}, ${body.name}, ${body.fft_size},
        ${body.window_function}, ${body.sample_rate},
        ${body.frequency_bins ? JSON.stringify(body.frequency_bins) : null},
        ${body.magnitude_db_summary ? JSON.stringify(body.magnitude_db_summary) : null},
        ${body.peak_frequency ?? null}, ${body.peak_magnitude_db ?? null},
        ${body.rms_db ?? null}, ${body.spectral_centroid ?? null}
      )
      RETURNING *
    `;

    return NextResponse.json(rows[0] as DbSnapshot, { status: 201 });
  } catch (error) {
    console.error("Failed to create snapshot:", error);
    return NextResponse.json({ error: "Failed to create snapshot" }, { status: 500 });
  }
}
