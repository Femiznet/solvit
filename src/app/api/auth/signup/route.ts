import { signupAction } from "@/actions/auth/actions";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";
import { parseJsonBody } from "@/lib/parse-body";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const parsed = await parseJsonBody(req);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: parsed.status }
      );
    }
    const body = parsed.data;
    const result = await signupAction(body);
    return actionResultToResponse(result, 201);
  } catch (error) {
    return routeErrorToResponse(error);
  }
}
