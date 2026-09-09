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

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter: id" },
        { status: 400 }
      );
    }

    const solutions = await selectUserSolutionsService({ input: { userId } });

    return NextResponse.json({ success: true, data: solutions }, { status: 200 });
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}
