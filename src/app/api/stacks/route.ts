// src/app/api/stacks/route.ts
import { NextResponse } from "next/server";
import { selectManyStacksService } from "@/services/stacks/select-stacks";
import { routeErrorToResponse } from "@/lib/http-response";

export async function GET() {
  try {
    const stacks = await selectManyStacksService();
    return NextResponse.json({ success: true, data: stacks }, { status: 200 });
  } catch (error) {
    return routeErrorToResponse(error);
  }
}