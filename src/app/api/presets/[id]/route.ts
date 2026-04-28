import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { DbPreset } from "@/types/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await sql`SELECT * FROM presets WHERE id = ${id}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0] as DbPreset);
  } catch (error) {
    console.error("Failed to fetch preset:", error);
    return NextResponse.json({ error: "Failed to fetch preset" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await sql`DELETE FROM presets WHERE id = ${id} AND is_default = false RETURNING id`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Preset not found or is default" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Failed to delete preset:", error);
    return NextResponse.json({ error: "Failed to delete preset" }, { status: 500 });
  }
}
