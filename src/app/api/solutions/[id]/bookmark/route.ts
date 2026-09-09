import { NextRequest, NextResponse } from "next/server";
import { bookmarkSolution } from "@/actions/bookmarks/actions";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: solutionId } = await params;
    const body = await request.json();
    const result = await bookmarkSolution({ ...body, solutionId });
    return actionResultToResponse(result);
  } catch (error) {
    return routeErrorToResponse(error);
  }
}
