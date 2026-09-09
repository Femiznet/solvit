import { NextRequest, NextResponse } from "next/server";
import { 
  updateSolutionAction, 
  deleteSolutionAction 
} from "@/actions/solutions/actions";
import { logServerError } from "@/utils/file-logger";
import { selectSingleSolutionService } from "@/services/solutions/select-solution";

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
      return NextResponse.json(
        { success: false, error: "Solution not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: solution }, { status: 200 });
  } catch (error: unknown) {
    const message = logServerError(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
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
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    const message = logServerError(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
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
    const body = await request.json();
    const result = await deleteSolutionAction({ ...body, solutionId });
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    const message = logServerError(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}