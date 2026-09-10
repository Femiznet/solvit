import { deleteStackAction, updateStackAction } from "@/actions/stacks/actions";
import { selectStackService } from "@/services/stacks/select-stacks";
import { NextRequest, NextResponse } from "next/server";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const stack = await selectStackService({ input: { id } });

    if (!stack) {
      return NextResponse.json(
        { success: false, error: "Stack not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: stack }, { status: 200 });
  } catch (error) {
    return routeErrorToResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: stackId } = await params;
    const body = await request.json();
    const result = await updateStackAction({ ...body, stackId });
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
    const { id: stackId } = await params;
    const result = await deleteStackAction({ stackId });
    return actionResultToResponse(result);
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}
