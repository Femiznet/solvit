import { deleteUserAction, updateUserAction } from "@/actions/users/actions";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";
import { parseJsonBody } from "@/lib/parse-body";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const parsed = await parseJsonBody(req);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: parsed.status }
      );
    }
    const body = parsed.data;
    const result = await updateUserAction(body);
    return actionResultToResponse(result);
  } catch (error) {
    return routeErrorToResponse(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const parsed = await parseJsonBody(req);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: parsed.status }
      );
    }
    const body = parsed.data;
    const result = await deleteUserAction(body);
    return actionResultToResponse(result);
  } catch (error) {
    return routeErrorToResponse(error);
  }
}
