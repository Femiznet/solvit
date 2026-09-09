import { NextRequest, NextResponse } from "next/server";
import { voteDifficultyAction } from "@/actions/projects/difficulty-votes";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const result = await voteDifficultyAction({ ...body, projectId });
    return actionResultToResponse(result);
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}
