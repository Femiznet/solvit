import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/dal";
import { AuthenticationError } from "@/lib/auth/errors";
import { routeErrorToResponse } from "@/lib/http-response";

export async function GET() {
  try {
    const user = await getSession();

    if (!user) {
      throw new AuthenticationError();
    }

    return NextResponse.json({ success: true, data: { user } }, { status: 200 });
  } catch (error) {
    return routeErrorToResponse(error, "auth-me-errors.log");
  }
}
