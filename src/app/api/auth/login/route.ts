import { loginAction } from "@/actions/auth/actions";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await loginAction(body);
    return actionResultToResponse(result);
  } catch (error) {
    return routeErrorToResponse(error);
  }
}
