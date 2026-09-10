// src/app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { selectSingleProjectService } from "@/services/projects/select-project";
import { updateProjectAction, deleteProjectAction } from "@/actions/projects/actions";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const solutionsLimit = Number(searchParams.get("solutionsLimit") ?? 10);
    const solutionsOffset = Number(searchParams.get("solutionsOffset") ?? 0);
    const project = await selectSingleProjectService({
      input: {
        projectId: id,
        solutionsLimit: Number.isNaN(solutionsLimit) ? 10 : solutionsLimit,
        solutionsOffset: Number.isNaN(solutionsOffset) ? 0 : solutionsOffset,
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: project }, { status: 200 });
  } catch (error) {
    return routeErrorToResponse(error);
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
    return actionResultToResponse(result);
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const result = await deleteProjectAction({ id });
    return actionResultToResponse(result);
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}
