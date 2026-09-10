import { selectUserSolutionsService } from "@/services/solutions/select-solution";
import { NextRequest, NextResponse } from "next/server";
import { routeErrorToResponse } from "@/lib/http-response";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id: userId } = await params;
    const { searchParams } = request.nextUrl;
    const limit = Number(searchParams.get("limit") ?? 20);
    const offset = Number(searchParams.get("offset") ?? 0);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter: id" },
        { status: 400 }
      );
    }

    const solutions = await selectUserSolutionsService({
      input: {
        userId,
        limit: Number.isNaN(limit) ? 20 : limit,
        offset: Number.isNaN(offset) ? 0 : offset,
      },
    });

    return NextResponse.json({ success: true, data: solutions }, { status: 200 });
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}
