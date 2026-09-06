import { NextResponse } from "next/server";
import { 
  createProjectLikeAction, 
  createSolutionLikeAction 
} from "@/actions/likes/actions";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const type = request.headers.get("x-like-type");

    let result;
    if (type === "solution") {
      result = await createSolutionLikeAction(body);
    } else {
      result = await createProjectLikeAction(body);
    }

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}