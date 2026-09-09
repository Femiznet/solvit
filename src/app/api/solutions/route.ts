import { NextResponse } from "next/server";
import { createSolutionAction } from "@/actions/solutions/actions";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await createSolutionAction(body);
    return actionResultToResponse(result);
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}
