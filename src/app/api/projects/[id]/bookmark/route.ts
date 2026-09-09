import { NextRequest, NextResponse } from "next/server";
import { bookmarkProject } from "@/actions/bookmarks/actions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const result = await bookmarkProject({ ...body, projectId });
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
