import { NextRequest, NextResponse } from "next/server";
import { selectUserBookmarksService } from "@/services/users/select-user";
import { logServerError } from "@/utils/file-logger";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required user ID" },
        { status: 400 }
      );
    }

    const bookmarks = await selectUserBookmarksService({ input: { id } });

    return NextResponse.json({ success: true, data: bookmarks }, { status: 200 });
  } catch (error) {
    const message = logServerError(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
