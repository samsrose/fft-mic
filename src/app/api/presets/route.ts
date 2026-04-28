import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { CreatePresetInput, DbPreset } from "@/types/db";

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM presets ORDER BY is_default DESC, created_at DESC`;
    return NextResponse.json(rows as DbPreset[]);
  } catch (error) {
    console.error("Failed to fetch presets:", error);
    return NextResponse.json({ error: "Failed to fetch presets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: CreatePresetInput = await request.json();

    const rows = await sql`
      INSERT INTO presets (
        name, description, fft_size, window_function, smoothing,
        sample_rate, bit_depth, gain, kaiser_beta,
        freq_min, freq_max, db_floor, db_ceiling,
        display_mode, frequency_scale, color_map,
        overlap, peak_hold, peak_decay_rate, show_windowed
      ) VALUES (
        ${body.name}, ${body.description ?? null}, ${body.fft_size},
        ${body.window_function}, ${body.smoothing}, ${body.sample_rate},
        ${body.bit_depth}, ${body.gain}, ${body.kaiser_beta},
        ${body.freq_min}, ${body.freq_max}, ${body.db_floor}, ${body.db_ceiling},
        ${body.display_mode}, ${body.frequency_scale}, ${body.color_map},
        ${body.overlap}, ${body.peak_hold}, ${body.peak_decay_rate}, ${body.show_windowed}
      )
      RETURNING *
    `;

    return NextResponse.json(rows[0] as DbPreset, { status: 201 });
  } catch (error) {
    console.error("Failed to create preset:", error);
    return NextResponse.json({ error: "Failed to create preset" }, { status: 500 });
  }
}
