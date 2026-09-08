// src/app/api/projects/route.ts
import { NextResponse } from "next/server";
import { createProjectAction } from "@/actions/projects/actions";
import { selectManyProjectsService } from "@/services/projects/select-project";
import { logServerError } from "@/utils/file-logger";

export async function GET() {
  try {
    const projects = await selectManyProjectsService();
    return NextResponse.json({ success: true, data: projects }, { status: 200 });
  } catch (error) {
    const message = logServerError(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await createProjectAction(body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    const message = logServerError(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}