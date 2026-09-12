// src/lib/parse-body.ts
//
// Bounded JSON body parser for API routes.
//
// `await request.json()` buffers and parses the ENTIRE body before zod ever
// runs, so a single huge payload (e.g. a million-element array) costs full
// parse + allocation + validation before it can be rejected. This helper caps
// the bytes actually read and rejects oversize/malformed bodies with 413/400
// before any action or schema sees them.
//
// Notes:
// - `text.length` counts UTF-16 code units, not bytes; multibyte chars
//   over-count slightly. Fine for a guardrail — the goal is rejecting the
//   50MB flood, not exact accounting.
// - `content-length` is attacker-controlled (can lie or be absent with chunked
//   encoding), so it is only a fast-path reject; the text-length check after
//   reading is the real guard.

export const DEFAULT_MAX_JSON_BODY_BYTES = 256 * 1024; // ~250KB
export const LARGE_MAX_JSON_BODY_BYTES = 1024 * 1024; // 1MB (project/solution content)
const MAX_BODY_KEYS = 100;

type ParseBodySuccess = {
  success: true;
  // `any` keeps call-site assignability identical to the old
  // `await request.json()` (which returns `any`). Zod validation inside the
  // actions remains the real type gate — this is only the transport shape.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};
type ParseBodyFailure = { success: false; error: string; status: 400 | 413 };

export type ParseBodyResult = ParseBodySuccess | ParseBodyFailure;

export async function parseJsonBody(
  req: Request,
  maxBytes: number = DEFAULT_MAX_JSON_BODY_BYTES
): Promise<ParseBodyResult> {
  // Fast-path: reject without reading when the client declares a huge body.
  const claimed = Number(req.headers.get("content-length"));
  if (Number.isFinite(claimed) && claimed > maxBytes) {
    return {
      success: false,
      error: `Payload too large. Limit is ${maxBytes} bytes.`,
      status: 413,
    };
  }

  let text: string;
  try {
    text = await req.text();
  } catch {
    return { success: false, error: "Failed to read request body.", status: 400 };
  }

  // Empty body -> empty object (lenient: bookmark/like/vote routes POST with
  // no meaningful body; required-field routes still 400 via zod downstream).
  if (text.length === 0 || text.trim().length === 0) {
    return { success: true, data: {} };
  }

  if (text.length > maxBytes) {
    return {
      success: false,
      error: `Payload too large. Limit is ${maxBytes} bytes.`,
      status: 413,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Previously this threw into routeErrorToResponse -> generic 500.
    return { success: false, error: "Invalid JSON.", status: 400 };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { success: false, error: "Request body must be a JSON object.", status: 400 };
  }

  const record = parsed as Record<string, unknown>;
  if (Object.keys(record).length > MAX_BODY_KEYS) {
    return { success: false, error: "Payload has too many fields.", status: 413 };
  }

  return { success: true, data: record };
}
