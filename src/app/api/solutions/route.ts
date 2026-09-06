import { NextResponse } from "next/server";
import { 
  createSolutionAction, 
  updateSolutionAction, 
  deleteSolutionAction 
} from "@/actions/solutions/actions";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await createSolutionAction(body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await updateSolutionAction(body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await deleteSolutionAction(body.id ?? body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}