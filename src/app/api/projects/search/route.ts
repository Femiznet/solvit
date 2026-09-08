import { NextRequest, NextResponse } from "next/server";
import { searchProjectsAction } from "@/actions/projects/search";
import { logServerError } from "@/utils/file-logger";
import type { SearchProjectsInput } from "@/zod-validators/zod-projects";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryParams: Record<string, unknown> = {};

    searchParams.forEach((value, key) => {
      if (key === "stackIds") {
        const rawValue = searchParams.get(key);
        queryParams[key] = rawValue ? rawValue.split(",").map(id => id.trim()) : [];
      } else {
        queryParams[key] = value;
      }
    });

    const result = await searchProjectsAction(queryParams as SearchProjectsInput);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    const message = logServerError(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}