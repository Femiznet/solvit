import { SignJWT, jwtVerify } from "jose";

const SECRET = process.env.AUTH_SECRET;
const TTL = process.env.AUTH_TOKEN_TTL ?? "7d";

if (!SECRET && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_SECRET is required in production");
}

const secretKey = () => {
  const key = SECRET ?? "dev-only-insecure-secret-change-me";
  return new TextEncoder().encode(key);
};

export function getSessionCookieName() {
  return "solvit_session";
}

export async function signSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TTL)
    .sign(secretKey());
}

export type SessionTokenPayload = {
  sub: string;
  iat: number;
  exp: number;
};

export async function verifySessionToken(
  token: string
): Promise<SessionTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub) return null;
    return payload as SessionTokenPayload;
  } catch {
    return null;
  }
}
