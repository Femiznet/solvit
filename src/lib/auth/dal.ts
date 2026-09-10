import "server-only";

import { cookies, headers } from "next/headers";
import { db } from "@/database";
import { users } from "@/database/schemas";
import { eq } from "drizzle-orm";
import {
  getSessionCookieName,
  verifySessionToken,
  type SessionTokenPayload,
} from "./session";
import { AuthenticationError, AuthorizationError } from "../errors";

export type UserRole = "user" | "admin";

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

async function readTokenFromHeaders(headersObj: Headers): Promise<string | null> {
  const authHeader = headersObj.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token.length > 0) return token;
  }
  return null;
}

async function readTokenFromRequest(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(getSessionCookieName())?.value;
  if (cookieToken) return cookieToken;

  const headersList = await headers();
  return readTokenFromHeaders(headersList);
}

async function resolveSession(): Promise<SessionTokenPayload | null> {
  const token = await readTokenFromRequest();
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getSession(): Promise<SafeUser | null> {
  const payload = await resolveSession();
  if (!payload) return null;

  const [user] = await db()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, payload.sub));

  return user ?? null;
}

export async function getSessionFromHeaders(
  requestHeaders: Headers
): Promise<SafeUser | null> {
  const token = await readTokenFromHeaders(requestHeaders);
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const [user] = await db()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, payload.sub));

  return user ?? null;
}

export async function requireUserId(): Promise<string> {
  const payload = await resolveSession();
  if (!payload) {
    throw new AuthenticationError();
  }
  return payload.sub;
}

/**
 * Returns the full SafeUser for the current session, or throws 401.
 * Use when you need role + id (admin checks, ownership checks, etc.).
 */
export async function requireUser(): Promise<SafeUser> {
  const user = await getSession();
  if (!user) {
    throw new AuthenticationError();
  }
  return user;
}

/**
 * Requires an authenticated admin. Throws 401 if unauthenticated, 403 if not admin.
 */
export async function requireAdmin(): Promise<SafeUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new AuthorizationError(
      "You do not have permission to perform this action."
    );
  }
  return user;
}

/**
 * Returns true if the current session belongs to an admin.
 * Does not throw — safe for conditional logic.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getSession();
  return user?.role === "admin";
}

/**
 * Asserts that the current user is the resource owner OR an admin.
 * `ownerId` is the userId that owns the target resource (not a resource id).
 */
export async function requireOwnerOrAdmin(ownerId: string): Promise<SafeUser> {
  const user = await requireUser();
  if (user.id !== ownerId && user.role !== "admin") {
    throw new AuthorizationError(
      "You can only access your own resources"
    );
  }
  return user;
}

/**
 * Asserts that the current user is operating on their own account OR is an admin.
 * `targetUserId` is the user id being targeted by the request.
 */
export async function requireSelfOrAdmin(targetUserId: string): Promise<SafeUser> {
  const user = await requireUser();
  if (user.id !== targetUserId && user.role !== "admin") {
    throw new AuthorizationError(
      "You can only modify your own account"
    );
  }
  return user;
}
