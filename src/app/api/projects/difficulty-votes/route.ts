import { NextResponse } from "next/server";
import { voteDifficultyAction } from "@/actions/projects/difficulty-votes";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await voteDifficultyAction(body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}