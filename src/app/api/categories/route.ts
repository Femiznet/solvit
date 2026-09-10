import { NextRequest, NextResponse } from "next/server";
import { createCategoryAction } from "@/actions/categories/actions";
import { selectManyCategoriesService } from "@/services/categories/select-category";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";
import { taxonomyPaginationSchema } from "@/zod-validators/zod-pagination";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const validation = taxonomyPaginationSchema.safeParse({
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
    const result = await selectManyCategoriesService({ ...validation.data });
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    return routeErrorToResponse(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await createCategoryAction(body);
    return actionResultToResponse(result);
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}
