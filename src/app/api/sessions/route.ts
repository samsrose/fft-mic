import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { CreateSessionInput, DbSession } from "@/types/db";

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM sessions ORDER BY started_at DESC LIMIT 50`;
    return NextResponse.json(rows as DbSession[]);
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateSessionInput = await request.json();

    const rows = await sql`
      INSERT INTO sessions (
        preset_id, device_label, source_type,
        fft_size, window_function, smoothing,
        sample_rate, bit_depth, gain
      ) VALUES (
        ${body.preset_id ?? null}, ${body.device_label ?? null}, ${body.source_type},
        ${body.fft_size}, ${body.window_function}, ${body.smoothing},
        ${body.sample_rate}, ${body.bit_depth}, ${body.gain}
      )
      RETURNING *
    `;

    return NextResponse.json(rows[0] as DbSession, { status: 201 });
  } catch (error) {
    console.error("Failed to create session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
