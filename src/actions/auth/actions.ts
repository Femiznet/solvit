"use server";

import { cookies } from "next/headers";
import { validateData } from "@/lib/validate";
import { safeAction } from "@/utils/file-logger";
import { signupSchema, loginSchema } from "@/zod-validators/zod-auth";
import { createUserService } from "@/services/users/create-user";
import { selectUserByEmailService } from "@/services/users/select-user";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signSessionToken, getSessionCookieName } from "@/lib/auth/session";
import type { SignupInput, LoginInput } from "@/zod-validators/zod-auth";
import { AuthenticationError } from "@/lib/errors";

export type AuthResult = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  token: string;
};

async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function signupAction(input: SignupInput) {
  const validation = validateData(signupSchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(
    async () => {
      const { name, email, password } = validation.data;
      const passwordHash = await hashPassword(password);

      const user = await createUserService({
        input: { name, email, passwordHash },
      });

      const token = await signSessionToken(user.id);
      await setSessionCookie(token);

      return {
        id: user.id,
        name,
        email,
        image: null,
        token,
      } satisfies AuthResult;
    },
    "Failed to create account.",
    {
      input: { name: validation.data.name, email: validation.data.email },
      constraintErrors: {
        users_email_unique: "An account with this email already exists.",
      },
    }
  );

  return result;
}

export async function loginAction(input: LoginInput) {
  const validation = validateData(loginSchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(
    async () => {
      const { email, password } = validation.data;

      const user = await selectUserByEmailService({ input: { email } });

      if (!user) {
        throw new AuthenticationError("Invalid email or password");
      }

      if (user.email === "deleted@localhost") {
        throw new AuthenticationError("Invalid email or password");
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        throw new AuthenticationError("Invalid email or password");
      }

      const token = await signSessionToken(user.id);
      await setSessionCookie(token);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        token,
      } satisfies AuthResult;
    },
    "Failed to log in.",
    { input: { email: validation.data.email } }
  );

  return result;
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(getSessionCookieName());
  return { success: true as const };
}
