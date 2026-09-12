import { NextRequest, NextResponse } from "next/server";
import { createProjectLikeAction } from "@/actions/likes/actions";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";
import { parseJsonBody } from "@/lib/parse-body";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: projectId } = await params;
    const parsed = await parseJsonBody(request);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: parsed.status }
      );
    }
    const body = parsed.data;
    // server id last: URL param wins over body
    const result = await createProjectLikeAction({ ...body, projectId });

    return actionResultToResponse(result);
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}
