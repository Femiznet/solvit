// src/app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { selectSingleProjectService } from "@/services/projects/select-project";
import { updateProjectAction, deleteProjectAction } from "@/actions/projects/actions";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";
import { projectDetailPaginationSchema } from "@/zod-validators/zod-pagination";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const pagination = projectDetailPaginationSchema.safeParse({
      solutionsLimit: searchParams.get("solutionsLimit") ?? undefined,
      solutionsOffset: searchParams.get("solutionsOffset") ?? undefined,
    });
    if (!pagination.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          fieldErrors: pagination.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    const project = await selectSingleProjectService({
      input: {
        projectId: id,
        solutionsLimit: pagination.data.solutionsLimit,
        solutionsOffset: pagination.data.solutionsOffset,
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
