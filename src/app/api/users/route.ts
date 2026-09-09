import { createUserAction, deleteUserAction, updateUserAction } from "@/actions/users/actions";
import { actionResultToResponse, routeErrorToResponse } from "@/lib/http-response";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createUserAction(body);
    return actionResultToResponse(result);
  } catch (error) {
    return routeErrorToResponse(error);
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const result = await updateUserAction(body);
    return actionResultToResponse(result);
  } catch (error) {
    return routeErrorToResponse(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const result = await deleteUserAction(body);
    return actionResultToResponse(result);
  } catch (error) {
    return routeErrorToResponse(error);
  }
}
