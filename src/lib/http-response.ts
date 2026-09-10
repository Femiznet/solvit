import { NextResponse } from "next/server";
import { logServerError, SafeActionResult } from "@/utils/file-logger";
import { BaseAppError } from "./errors";

/**
 * Convert an action result into a NextResponse.
 *
 * The failure shape carries `status` (the HTTP status) and optionally
 * `fieldErrors` (per-field validation errors). We strip `status` out of
 * the JSON body so protocol status lives in the HTTP status line, not
 * the payload. `fieldErrors` is preserved on failure so clients can
 * render per-field errors.
 */
export function actionResultToResponse<T>(
  result: SafeActionResult<T>,
  successStatus: number = 200
): NextResponse {
  if (result.success) {
    return NextResponse.json(result, { status: successStatus });
  }

  const { status, fieldErrors, ...rest } = result;
  const body = fieldErrors ? { ...rest, fieldErrors } : rest;

  return NextResponse.json(body, { status: status ?? 400 });
}

/**
 * Map an error thrown outside an action (e.g. request.json() failure,
 * direct DAL call) into a NextResponse.
 *
 * Auth errors map to their protocol status. Everything else is logged
 * and returned as a generic 500 so we never leak internals.
 */
export function routeErrorToResponse(error: unknown, fileName?: string): NextResponse {
  if (error instanceof BaseAppError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status }
    );
  }

  const message = logServerError(error, fileName);
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
