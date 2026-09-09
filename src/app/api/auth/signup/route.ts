import { signupAction } from "@/actions/auth/actions";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await signupAction(body);
    return actionResultToResponse(result, 201);
  } catch (error) {
    return routeErrorToResponse(error);
  }
}
