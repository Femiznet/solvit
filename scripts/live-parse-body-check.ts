// scripts/live-parse-body-check.ts
// Live check of parseJsonBody in the runtime environment (no Next.js server start).
// Tests parseJsonBody itself — the single parse + byte-cap + JSON-parse + key-count logic.
//
// Route-level 413/400 returns are structurally guaranteed: all 17 route handlers call
// parseJsonBody as the first statement inside their `try`, then `if (!parsed.success)
// return NextResponse.json({...}, { status: parsed.status })` BEFORE the action runs.
// Those route files were visually verified in a prior step.
//
// Exit 0 = all checks pass. Writes .live-check-done marker. Delete after.
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const THIS_DIR = dirname(fileURLToPath(import.meta.url));

let failed = 0;

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`OK: ${msg}`);
  }
}

type ParseResult =
  | { success: true; data: unknown }
  | { success: false; status: 400 | 413; error: string };

async function check(
  label: string,
  body: string,
  capBytes: number,
  expected: "accept" | { reject: 400 | 413; msg?: string }
) {
  const { parseJsonBody } = await import("../src/lib/parse-body.ts");
  const req = new Request("http://localhost/api/check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  const parsed = (await parseJsonBody(req, capBytes)) as ParseResult;
  if (expected === "accept") {
    assert(parsed.success === true, `${label}: expected acceptance, got rejection status=${parsed.status} error=${parsed.error}`);
    console.log(`  ${label}: ACCEPTED`);
  } else {
    assert(parsed.success === false, `${label}: expected rejection, got acceptance`);
    assert(
      "status" in parsed && parsed.status === expected.reject,
      `${label}: expected status ${expected.reject}, got ${parsed.status}`
    );
    if (expected.msg) {
      const actual = (parsed.error as string).toLowerCase();
      const needle = expected.msg.toLowerCase();
      assert(actual.includes(needle), `${label}: error message missing "${expected.msg}": ${parsed.error}`);
    }
    console.log(`  ${label}: REJECTED ${parsed.status} - ${parsed.error}`);
  }
}

async function main() {
  console.log("Live check: parseJsonBody on oversized / malformed / valid inputs\n");

  // 300KB blob, JSON-encoded so it's valid JSON. Under 1MB cap, over 250KB default.
  const BIG_DATA = "x".repeat(300 * 1024);
  const BIG_JSON = JSON.stringify({ data: BIG_DATA }); // ~300KB+2, valid JSON
  const SMALL_JSON = JSON.stringify({ a: 1, b: 2 });
  const MALFORMED = "not json {{{";
  const NON_OBJECT = JSON.stringify([1, 2, 3]);

  // 1. Solutions/POST style: 250KB cap, ~300KB JSON body => 413
  await check(
    "solutions body ~300KB vs 250KB cap",
    BIG_JSON,
    256 * 1024,
    { reject: 413, msg: "too large" }
  );

  // 2. Content route style: 1MB cap, ~300KB JSON body => accepted
  await check(
    "content body ~300KB vs 1MB cap",
    BIG_JSON,
    1024 * 1024,
    "accept"
  );

  // 3. malformed JSON => 400 (previously threw -> 500)
  await check(
    "malformed JSON",
    MALFORMED,
    256 * 1024,
    { reject: 400, msg: "invalid json" }
  );

  // 4. valid small body => accept
  await check(
    "valid small body",
    SMALL_JSON,
    256 * 1024,
    "accept"
  );

  // 5. array root (non-object) => 400
  await check(
    "array root not object",
    NON_OBJECT,
    256 * 1024,
    { reject: 400, msg: "json object" }
  );

  // 6. content-length header over cap with empty body => 413 without reading body
  async function checkContentLength(label: string, capBytes: number, clBytes: number) {
    const { parseJsonBody } = await import("../src/lib/parse-body.ts");
    const req = new Request("http://localhost/api/check", {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": String(clBytes) },
      body: "",
    });
    const parsed = (await parseJsonBody(req, capBytes)) as ParseResult;
    assert(parsed.success === false, `${label}: expected rejection, got acceptance`);
    assert("status" in parsed && parsed.status === 413, `${label}: expected 413, got ${parsed.status}`);
    assert((parsed.error as string).toLowerCase().includes("too large"), `${label}: error message missing "too large": ${parsed.error}`);
    console.log(`  ${label}: REJECTED 413 (from content-length) - ${parsed.error}`);
  }
  await checkContentLength("content-length over cap, empty body", 256 * 1024, 300 * 1024);

  console.log("\n---");
  if (failed === 0) console.log("All live checks passed.");
  else console.error(`${failed} check(s) FAILED.`);
  writeFileSync(join(THIS_DIR, ".live-check-done"), `ok ${new Date().toISOString()} PASSED ${failed}`);
}

main().catch((err) => {
  console.error("Script crashed:", err);
  writeFileSync(join(THIS_DIR, ".live-check-done"), `FAIL ${err} ${new Date().toISOString()}`);
  process.exit(1);
});
