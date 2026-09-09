import { NextResponse } from "next/server";
import { createCategoryAction } from "@/actions/categories/actions";
import { selectManyCategoriesService } from "@/services/categories/select-category";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";

export async function GET() {
  try {
    const categories = await selectManyCategoriesService();
    return NextResponse.json({ success: true, data: categories }, { status: 200 });
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
