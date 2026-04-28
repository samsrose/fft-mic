import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { EndSessionInput, DbSession } from "@/types/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await sql`SELECT * FROM sessions WHERE id = ${id}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0] as DbSession);
  } catch (error) {
    console.error("Failed to fetch session:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: EndSessionInput = await request.json();

    const rows = await sql`
      UPDATE sessions SET
        ended_at = now(),
        duration_seconds = EXTRACT(EPOCH FROM (now() - started_at)),
        avg_db = ${body.avg_db ?? null},
        peak_db = ${body.peak_db ?? null},
        peak_frequency = ${body.peak_frequency ?? null},
        notes = ${body.notes ?? null}
      WHERE id = ${id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0] as DbSession);
  } catch (error) {
    console.error("Failed to update session:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
