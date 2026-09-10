import { NextRequest, NextResponse } from "next/server";
import { selectUserBookmarksService } from "@/services/users/select-user";
import { routeErrorToResponse } from "@/lib/http-response";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const limit = Number(searchParams.get("limit") ?? 20);
    const offset = Number(searchParams.get("offset") ?? 0);

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required user ID" },
        { status: 400 }
      );
    }

    const bookmarks = await selectUserBookmarksService({
      input: {
        id,
        limit: Number.isNaN(limit) ? 20 : limit,
        offset: Number.isNaN(offset) ? 0 : offset,
      },
    });

    return NextResponse.json({ success: true, data: bookmarks }, { status: 200 });
  } catch (error) {
    return routeErrorToResponse(error);
  }
}
