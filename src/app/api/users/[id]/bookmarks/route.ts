import { NextRequest, NextResponse } from "next/server";
import { selectUserBookmarksService } from "@/services/users/select-user";
import { routeErrorToResponse } from "@/lib/http-response";
import { paginationSchema } from "@/zod-validators/zod-pagination";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required user ID" },
        { status: 400 }
      );
    }

    const validation = paginationSchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    });
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          fieldErrors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const bookmarks = await selectUserBookmarksService({
      input: {
        id,
        limit: validation.data.limit,
        offset: validation.data.offset,
      },
    });

    return NextResponse.json({ success: true, data: bookmarks }, { status: 200 });
  } catch (error) {
    return routeErrorToResponse(error);
  }
}
