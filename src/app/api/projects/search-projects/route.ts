import { NextResponse } from "next/server";
import { searchProjectsAction } from "@/actions/projects/search-projects";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams: Record<string, unknown> = {};

    searchParams.forEach((value, key) => {
      if (key === "stackIds") {
        queryParams[key] = searchParams.getAll(key);
      } else {
        queryParams[key] = value;
      }
    });

    const result = await searchProjectsAction(queryParams as any);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}