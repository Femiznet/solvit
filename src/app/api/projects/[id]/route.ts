// src/app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { selectSingleProjectService } from "@/services/projects/select-project";
import { updateProjectAction, deleteProjectAction } from "@/actions/projects/actions";
import { logServerError } from "@/utils/file-logger";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = await selectSingleProjectService({ input: { projectId: id } });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: project }, { status: 200 });
  } catch (error) {
    const message = logServerError(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await updateProjectAction({ ...body, id });
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    const message = logServerError(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const result = await deleteProjectAction({ id });
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    const message = logServerError(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
