import "server-only";

import { cookies } from "next/headers";
import { db } from "@/database";
import { users } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { AuthenticationError, AuthorizationError } from "./errors";
import {
  getSessionCookieName,
  verifySessionToken,
  type SessionTokenPayload,
} from "./session";

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

async function readTokenFromRequest(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(getSessionCookieName())?.value;
  if (cookieToken) return cookieToken;
  return null;
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

export async function requireOwner(targetUserId: string): Promise<string> {
  const session = await getSession();
  if (!session) {
    throw new AuthenticationError();
  }
  if (session.id !== targetUserId) {
    throw new AuthorizationError(
      "You can only access your own resources"
    );
  }
  return session.id;
}
