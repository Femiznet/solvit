import { NextRequest, NextResponse } from "next/server";
import { createStackAction } from "@/actions/stacks/actions";
import { selectManyStacksService } from "@/services/stacks/select-stacks";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = Number(searchParams.get("limit") ?? 50);
    const offset = Number(searchParams.get("offset") ?? 0);
    const stacks = await selectManyStacksService({
      limit: Number.isNaN(limit) ? 50 : limit,
      offset: Number.isNaN(offset) ? 0 : offset,
    });
    return NextResponse.json({ success: true, data: stacks }, { status: 200 });
  } catch (error) {
    return routeErrorToResponse(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await createStackAction(body);
    return actionResultToResponse(result);
  } catch (error: unknown) {
    return routeErrorToResponse(error);
  }
}