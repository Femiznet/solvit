import { NextRequest, NextResponse } from "next/server";
import { createSolutionAction } from "@/actions/solutions/actions";
import { searchSolutionsAction } from "@/actions/solutions/search";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";
import { LARGE_MAX_JSON_BODY_BYTES, parseJsonBody } from "@/lib/parse-body";
import { searchSolutionsSchema } from "@/zod-validators/zod-solutions";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    const params = {
      projectId: searchParams.get("projectId") ?? "",
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    };
    const validation = searchSolutionsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters", fieldErrors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const result = await searchSolutionsAction(validation.data);
    return actionResultToResponse(result);
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Solution payloads can carry long content, so allow 1MB here.
    const parsed = await parseJsonBody(request, LARGE_MAX_JSON_BODY_BYTES);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: parsed.status }
      );
    }
    const body = parsed.data;
    const result = await createSolutionAction(body);
    return actionResultToResponse(result);
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}
