import { NextResponse } from "next/server";
import { 
  createUserAction, 
  updateUserAction, 
  deleteUserAction 
} from "@/actions/users/actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createUserAction(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request payload or internal error." }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const result = await updateUserAction(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API PUT Error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request payload or internal error." }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const result = await deleteUserAction(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request payload or internal error." }, 
      { status: 500 }
    );
  }
}