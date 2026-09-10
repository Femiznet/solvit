import { selectUserSolutionsService } from "@/services/solutions/select-solution";
import { NextRequest, NextResponse } from "next/server";
import { routeErrorToResponse } from "@/lib/http-response";
import { paginationSchema } from "@/zod-validators/zod-pagination";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id: userId } = await params;
    const { searchParams } = request.nextUrl;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter: id" },
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

    const solutions = await selectUserSolutionsService({
      input: {
        userId,
        limit: validation.data.limit,
        offset: validation.data.offset,
      },
    });

    return NextResponse.json({ success: true, data: solutions }, { status: 200 });
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}
