import { getSessionCookieName } from "./session";

export const SESSION_COOKIE = getSessionCookieName();

const PUBLIC_READ_PREFIXES: string[] = [
  "/api/projects",
  "/api/solutions",
  "/api/categories",
  "/api/stacks",
];

const PUBLIC_USER_READ_PATHS: RegExp[] = [
  /^\/api\/users\/[^/]+$/,
  /^\/api\/users\/[^/]+\/solutions$/,
];

const PROTECTED_READ_PATHS: RegExp[] = [
  /^\/api\/users\/[^/]+\/bookmarks$/,
  /^\/api\/users\/[^/]+\/likes$/,
  /^\/api\/auth\/me$/,
  /^\/api\/auth\/logout$/,
];

const PUBLIC_WRITE_PATHS: Set<string> = new Set([
  "/api/auth/signup",
  "/api/auth/login",
]);

export function isPublicReadPath(pathname: string): boolean {
  if (PUBLIC_READ_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (PUBLIC_USER_READ_PATHS.some((re) => re.test(pathname))) return true;
  return false;
}

export function isProtectedReadPath(pathname: string): boolean {
  return PROTECTED_READ_PATHS.some((re) => re.test(pathname));
}

export function isPublicWritePath(pathname: string): boolean {
  return PUBLIC_WRITE_PATHS.has(pathname);
}

export function hasCredentials(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce<Record<string, string>>(
      (acc, pair) => {
        const [key, ...rest] = pair.trim().split("=");
        if (key) acc[key] = rest.join("=");
        return acc;
      },
      {}
    );
    if (cookies[SESSION_COOKIE]) return true;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim().length > 0;
  }

  return false;
}
