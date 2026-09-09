import { NextRequest, NextResponse } from "next/server";
import { updateSolutionAction, deleteSolutionAction } from "@/actions/solutions/actions";
import { selectSingleSolutionService } from "@/services/solutions/select-solution";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id: solutionId } = await params;

    if (!solutionId) {
      return NextResponse.json(
        { success: false, error: "Missing required solution ID" },
        { status: 400 }
      );
    }

    const solution = await selectSingleSolutionService({ input: { solutionId } });

    if (!solution) {
      return NextResponse.json({ success: false, error: "Solution not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: solution }, { status: 200 });
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id: solutionId } = await params;

    if (!solutionId) {
      return NextResponse.json(
        { success: false, error: "Missing required solution ID" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const result = await updateSolutionAction({ ...body, solutionId });
    return actionResultToResponse(result);
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id: solutionId } = await params;

    if (!solutionId) {
      return NextResponse.json(
        { success: false, error: "Missing required solution ID" },
        { status: 400 }
      );
    }
    const result = await deleteSolutionAction({ solutionId });
    return actionResultToResponse(result);
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}
