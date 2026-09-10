import { NextResponse } from "next/server";
import { db } from "@/database";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db().select({ now: sql<number>`1` });
    return NextResponse.json(
      { status: "ok", db: "up", time: new Date().toISOString() },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { status: "error", db: "down", time: new Date().toISOString() },
      { status: 503 }
    );
  }
}
