import { NextRequest, NextResponse } from "next/server";
import { searchProjectsAction } from "@/actions/projects/search";
import { logServerError } from "@/utils/file-logger";
import { parseSearchParams } from "@/utils/parse-search-params";

export async function GET(request: NextRequest) {
  try {
    const queryParams = parseSearchParams(request.nextUrl.searchParams);
    const result = await searchProjectsAction(queryParams);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    const message = logServerError(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
