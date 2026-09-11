import { NextRequest, NextResponse } from "next/server";
import { selectUserService } from "@/services/users/select-user";
import { routeErrorToResponse, actionResultToResponse } from "@/lib/http-response";
import { parseJsonBody } from "@/lib/parse-body";
import { setUserRoleAction } from "@/actions/users/admin-actions";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required user ID" },
        { status: 400 }
      );
    }

    const user = await selectUserService({ input: { id } });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    return routeErrorToResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const parsed = await parseJsonBody(request);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: parsed.status }
      );
    }
    const body = parsed.data;
    // server id last: URL param wins over body
    const result = await setUserRoleAction({ ...body, targetUserId });
    return actionResultToResponse(result);
  } catch (error) {
    return routeErrorToResponse(error);
  }
}
