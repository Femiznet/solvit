import { NextResponse } from "next/server";
import { logoutAction } from "@/actions/auth/actions";
import { routeErrorToResponse } from "@/lib/http-response";

export async function POST() {
  try {
    await logoutAction();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return routeErrorToResponse(error);
  }
}
