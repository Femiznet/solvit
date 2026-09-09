import { NextRequest, NextResponse } from "next/server";
import { bookmarkSolution } from "@/actions/bookmarks/actions";
import { logServerError } from "@/utils/file-logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: solutionId } = await params;
    const body = await request.json();
    const result = await bookmarkSolution({ ...body, solutionId });
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    const message = logServerError(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
