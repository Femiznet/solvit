import { deleteStackAction, updateStackAction } from "@/actions/stacks/actions";
import { selectStackService } from "@/services/stacks/select-stacks";
import { NextRequest, NextResponse } from "next/server";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";
import { parseJsonBody } from "@/lib/parse-body";

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
    const parsed = await parseJsonBody(request);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: parsed.status }
      );
    }
    const body = parsed.data;
    // server id last: URL param wins over body
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
