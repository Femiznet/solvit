// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createProjectAction } from "@/actions/projects/actions";
import { searchProjectsAction } from "@/actions/projects/search";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";
import { parseSearchParams } from "@/utils/parse-search-params";

// GET is the list endpoint: it delegates to the same search pipeline as
// /api/projects/search (with no filters it returns the newest page), so both
// endpoints share one response shape: { success, data: { projects, pagination } }.
export async function GET(request: NextRequest) {
  try {
    const queryParams = parseSearchParams(request.nextUrl.searchParams);
    const result = await searchProjectsAction(queryParams);
    return actionResultToResponse(result);
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await createProjectAction(body);
    return actionResultToResponse(result);
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}
