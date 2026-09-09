// src/app/api/stacks/route.ts
import { NextResponse } from "next/server";
import { logServerError } from "@/utils/file-logger";
import { selectManyStacksService } from "@/services/stacks/select-stacks";

export async function GET() {
  try {
    const stacks = await selectManyStacksService();
    return NextResponse.json({ success: true, data: stacks }, { status: 200 });
  } catch (error) {
    const message = logServerError(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}