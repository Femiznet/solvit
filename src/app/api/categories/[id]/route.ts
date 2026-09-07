import { deleteCategoryAction, updateCategoryAction } from "@/actions/categories/actions";
import { logServerError } from "@/utils/file-logger";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
    const { id: categoryId } = await params;
      const body = await request.json();
        const result = await updateCategoryAction({ ...body, categoryId });
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    } catch (error: unknown) {
      const message = logServerError(error)
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  }
  
  export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
    const { id: categoryId } = await params;
        const result = await deleteCategoryAction({ categoryId });
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    } catch (error: unknown) {
      const message = logServerError(error)
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  }
      
