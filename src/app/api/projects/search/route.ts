import { NextRequest } from "next/server";
import { searchProjectsAction } from "@/actions/projects/search";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";
import { parseSearchParams } from "@/utils/parse-search-params";

export async function GET(request: NextRequest) {
  try {
    const queryParams = parseSearchParams(request.nextUrl.searchParams);
    const result = await searchProjectsAction(queryParams);
    return actionResultToResponse(result);
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}
