import { NextResponse } from "next/server";
import { 
  createCategoryAction, 
} from "@/actions/categories/actions";
import { logServerError } from "@/utils/file-logger";
import { selectManyCategoriesService } from "@/services/categories/select-category";


export async function GET() {
  try {
    const categories = await selectManyCategoriesService();
    return NextResponse.json({ success: true, data: categories }, { status: 200 });
  } catch (error) {
    const message = logServerError(error)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await createCategoryAction(body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    const message = logServerError(error)
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

