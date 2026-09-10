import { NextRequest, NextResponse } from "next/server";
import {
  hasCredentials,
  isProtectedReadPath,
  isPublicReadPath,
  isPublicWritePath,
} from "./lib/auth/proxy-guard";

const READ_METHODS = ["GET", "HEAD", "OPTIONS"];

function unauthorized() {
  return NextResponse.json(
    { success: false, error: "Authentication required" },
    { status: 401 }
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // Only scope to /api (matcher enforces this, defensive)
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Public writes: signup/login always reachable
  if (isPublicWritePath(pathname)) {
    return NextResponse.next();
  }

  const isRead = READ_METHODS.includes(method);

  // Public reads pass through
  if (isRead && isPublicReadPath(pathname)) {
    return NextResponse.next();
  }

  // Protected reads require credentials
  if (isRead && isProtectedReadPath(pathname)) {
    return hasCredentials(request) ? NextResponse.next() : unauthorized();
  }

  // All writes (POST/PUT/DELETE/PATCH) require credentials
  if (!isRead) {
    return hasCredentials(request) ? NextResponse.next() : unauthorized();
  }

  // Default: allow other reads (e.g. /api/users collection listing if added later)
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
