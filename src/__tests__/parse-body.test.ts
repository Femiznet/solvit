import { describe, expect, it } from "vitest";
import {
  DEFAULT_MAX_JSON_BODY_BYTES,
  LARGE_MAX_JSON_BODY_BYTES,
  parseJsonBody,
} from "@/lib/parse-body";

function req(body: string, contentLength?: string): Request {
  const headers: Record<string, string> = {};
  if (contentLength !== undefined) headers["content-length"] = contentLength;
  return new Request("http://localhost/api/test", { method: "POST", headers, body });
}

describe("parseJsonBody", () => {
  it("passes a valid small body through", async () => {
    const result = await parseJsonBody(req(JSON.stringify({ name: "x" })));
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({ name: "x" });
  });

  it("rejects oversize declared content-length without reading the body", async () => {
    const huge = "x".repeat(DEFAULT_MAX_JSON_BODY_BYTES + 1);
    const result = await parseJsonBody(req(huge, String(huge.length)));
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining("Payload too large"),
      status: 413,
    });
  });

  it("rejects an oversize actual body even when content-length lies", async () => {
    const huge = "x".repeat(DEFAULT_MAX_JSON_BODY_BYTES + 1);
    const result = await parseJsonBody(req(JSON.stringify({ blob: huge }), "10"));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.status).toBe(413);
  });

  it("rejects malformed JSON with 400 (previously a 500)", async () => {
    const result = await parseJsonBody(req("{not json"));
    expect(result).toEqual({ success: false, error: "Invalid JSON.", status: 400 });
  });

  it("rejects non-object roots", async () => {
    for (const body of ['[1,2]', '"str"', "42", "null"]) {
      const result = await parseJsonBody(req(body));
      expect(result.success).toBe(false);
      if (!result.success) expect(result.status).toBe(400);
    }
  });

  it("rejects bodies with too many keys", async () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 101; i++) obj[`k${i}`] = i;
    const result = await parseJsonBody(req(JSON.stringify(obj)));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("too many fields");
      expect(result.status).toBe(413);
    }
  });

  it("treats an empty body as an empty object (lenient for bodyless toggles)", async () => {
    const result = await parseJsonBody(req(""));
    expect(result).toEqual({ success: true, data: {} });
  });

  it("honors a larger cap override for content routes", async () => {
    const big = "x".repeat(DEFAULT_MAX_JSON_BODY_BYTES + 100);
    const accepted = await parseJsonBody(
      req(JSON.stringify({ blob: big })),
      LARGE_MAX_JSON_BODY_BYTES
    );
    expect(accepted.success).toBe(true);
  });
});
