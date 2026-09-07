import { selectUserSolutionsService } from "@/services/solutions/select-solution";
import { logServerError } from "@/utils/file-logger";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter: userId" },
        { status: 400 }
      );
    }

    const solutions = await selectUserSolutionsService({ input: { userId } });

    return NextResponse.json({ success: true, data: solutions }, { status: 200 });
  } catch (error: unknown) {
    const message = logServerError(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
