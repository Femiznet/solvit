/**
 * Allowlist / trust-list for solution `repoUrl` and `demoUrl`.
 *
 * Policy (v1):
 * - `repoUrl` is a CLOSED net: must be https + exact host in ALLOWED_REPO_HOSTS
 *   (or suffix in ALLOWED_REPO_SUFFIXES). Anything else is rejected by Zod.
 * - `demoUrl` is OPEN: any public https URL is accepted. TRUSTED lists below
 *   are only for a "Verified / Trusted demo" badge in the UI, not for rejection.
 * - Both reject private/internal hosts: localhost, 127.x, 10.x, 192.168.x,
 *   172.16-31.x, 169.254.x, 0.0.0.0, ::1, fe80::/10, fc00::/7, *.local,
 *   *.localhost, *.internal, *.lan, single-label hostnames.
 */

// --- Closed net for repos (enforced) ---
export const ALLOWED_REPO_HOSTS = [
  "github.com",
  "gist.github.com",
  "gitlab.com",
  "bitbucket.org",
  "codeberg.org",
  "sourcehut.org",
  "git.sr.ht",
  "dev.azure.com",
] as const;

/** Suffix match (apex + any subdomain), e.g. `foo.visualstudio.com`. */
export const ALLOWED_REPO_SUFFIXES = ["visualstudio.com"] as const;

// --- Trusted demo hosts (badge only, NOT enforced) ---
export const TRUSTED_DEMO_HOSTS = [
  "codepen.io",
  "codesandbox.io",
  "stackblitz.io",
  "jsfiddle.net",
  "replit.com",
  "vercel.com",
  "netlify.com",
] as const;

/** Suffix match for trusted demo badge, e.g. `my-app.vercel.app`. */
export const TRUSTED_DEMO_SUFFIXES = [
  "vercel.app",
  "netlify.app",
  "github.io",
  "gitlab.io",
  "pages.dev",
  "web.app",
  "firebaseapp.com",
  "replit.dev",
  "onrender.com",
  "up.railway.app",
  "herokuapp.com",
  "fly.dev",
  "azurewebsites.net",
  "amplifyapp.com",
  "cloudfront.net",
  "streamlit.app",
] as const;

export const REPO_URLS_ERROR =
  "Repository URL must be an https link from github.com, gist.github.com, gitlab.com, bitbucket.org, codeberg.org, sourcehut.org, git.sr.ht, dev.azure.com, or *.visualstudio.com.";

export const DEMO_URL_ERROR =
  "Demo URL must be a public https URL (no localhost, private IPs, or internal hostnames).";

function stripWww(host: string): string {
  return host.startsWith("www.") ? host.slice(4) : host;
}

export function normalizeHostname(hostname: string): string {
  return stripWww(hostname.trim().toLowerCase().replace(/\.+$/, ""));
}

/** IPv4 private/loopback/link-local check. */
function isBlockedIpv4(host: string): boolean {
  const parts = host.split(".");
  if (parts.length !== 4) return false;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = nums;
  if (a === 127) return true; // loopback 127.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 169 && b === 254) return true; // link-local
  if (a === 0) return true; // 0.0.0.0/8
  return false;
}

/** IPv6 loopback/link-local/unique-local check (string-prefix, no dep). */
function isBlockedIpv6(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "::1" || h === "::") return true;
  if (h.startsWith("fe80:")) return true; // link-local fe80::/10 (approx)
  if (h.startsWith("fc") || h.startsWith("fd")) return true; // unique-local fc00::/7
  return false;
}

export function isBlockedHostname(rawHostname: string): boolean {
  const host = normalizeHostname(rawHostname);
  if (!host) return true;
  if (host === "localhost") return true;
  if (host.endsWith(".localhost")) return true;
  if (
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".lan")
  )
    return true;
  if (isBlockedIpv4(host)) return true;
  if (host.includes(":") && isBlockedIpv6(host)) return true;
  // Single-label hostnames (e.g. `myserver`, `intranet`) are internal.
  if (!host.includes(".")) return true;
  return false;
}

function matchesHostOrSuffix(host: string, exact: readonly string[], suffixes: readonly string[]): boolean {
  const normalized = normalizeHostname(host);
  if ((exact as readonly string[]).includes(normalized)) return true;
  return (suffixes as readonly string[]).some(
    (s) => normalized === s || normalized.endsWith(`.${s}`)
  );
}

function parseHttpsUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (isBlockedHostname(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

/** Closed-net check for `repoUrl`. Returns true only for allowlisted https hosts. */
export function isAllowedRepoHost(value: string): boolean {
  const url = parseHttpsUrl(value);
  if (!url) return false;
  return matchesHostOrSuffix(url.hostname, ALLOWED_REPO_HOSTS, ALLOWED_REPO_SUFFIXES);
}

/** Open check for `demoUrl`: any public https URL. */
export function isSafeDemoUrl(value: string): boolean {
  return parseHttpsUrl(value) !== null;
}

/** Badge helper for `demoUrl`: true when host is in the known-good demo list. */
export function isTrustedDemoHost(value: string): boolean {
  try {
    const url = new URL(value);
    return matchesHostOrSuffix(url.hostname, TRUSTED_DEMO_HOSTS, TRUSTED_DEMO_SUFFIXES);
  } catch {
    return false;
  }
}

/** Badge helper for `repoUrl`: same as the enforcement check. */
export function isTrustedRepoHost(value: string): boolean {
  return isAllowedRepoHost(value);
}

export type SolutionUrlTrust =
  | { kind: "repo"; trusted: boolean }
  | { kind: "demo"; trusted: boolean }
  | { kind: "custom"; trusted: false };

/**
 * UI helper: given a stored url, decide which badge to show.
 * - repo urls: trusted = allowlisted
 * - demo urls: trusted = known demo host/suffix, otherwise custom (still valid)
 */
export function getSolutionUrlTrust(
  url: string,
  kind: "repo" | "demo"
): SolutionUrlTrust {
  if (kind === "repo") return { kind, trusted: isTrustedRepoHost(url) };
  const trusted = isTrustedDemoHost(url);
  return trusted ? { kind, trusted } : { kind: "custom", trusted: false };
}
