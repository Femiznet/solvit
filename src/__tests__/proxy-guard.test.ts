import { describe, expect, it } from "vitest";
import {
  hasCredentials,
  isProtectedReadPath,
  isPublicReadPath,
  isPublicWritePath,
} from "@/lib/auth/proxy-guard";

describe("proxy-guard path classification", () => {
  describe("isPublicWritePath", () => {
    it("allows signup and login", () => {
      expect(isPublicWritePath("/api/auth/signup")).toBe(true);
      expect(isPublicWritePath("/api/auth/login")).toBe(true);
    });

    it("rejects other paths", () => {
      expect(isPublicWritePath("/api/auth/logout")).toBe(false);
      expect(isPublicWritePath("/api/users")).toBe(false);
      expect(isPublicWritePath("/api/projects")).toBe(false);
    });
  });

  describe("isPublicReadPath", () => {
    it("allows project/solution/category/stacks reads", () => {
      expect(isPublicReadPath("/api/projects")).toBe(true);
      expect(isPublicReadPath("/api/projects/123")).toBe(true);
      expect(isPublicReadPath("/api/projects/search")).toBe(true);
      expect(isPublicReadPath("/api/solutions")).toBe(true);
      expect(isPublicReadPath("/api/solutions/abc")).toBe(true);
      expect(isPublicReadPath("/api/categories")).toBe(true);
      expect(isPublicReadPath("/api/stacks")).toBe(true);
    });

    it("allows user profile and user solutions reads", () => {
      expect(isPublicReadPath("/api/users/123")).toBe(true);
      expect(isPublicReadPath("/api/users/123/solutions")).toBe(true);
    });

    it("rejects protected user reads", () => {
      expect(isPublicReadPath("/api/users/123/bookmarks")).toBe(false);
      expect(isPublicReadPath("/api/users/123/likes")).toBe(false);
    });

    it("rejects auth/me and auth/logout", () => {
      expect(isPublicReadPath("/api/auth/me")).toBe(false);
      expect(isPublicReadPath("/api/auth/logout")).toBe(false);
    });
  });

  describe("isProtectedReadPath", () => {
    it("matches owner-scoped reads", () => {
      expect(isProtectedReadPath("/api/users/123/bookmarks")).toBe(true);
      expect(isProtectedReadPath("/api/users/123/likes")).toBe(true);
      expect(isProtectedReadPath("/api/auth/me")).toBe(true);
      expect(isProtectedReadPath("/api/auth/logout")).toBe(true);
    });

    it("rejects public reads", () => {
      expect(isProtectedReadPath("/api/projects")).toBe(false);
      expect(isProtectedReadPath("/api/users/123/solutions")).toBe(false);
    });
  });

  describe("hasCredentials", () => {
    it("returns true when session cookie present", () => {
      const req = new Request("http://localhost/api/test", {
        headers: { cookie: "solvit_session=abc123; other=xyz" },
      });
      expect(hasCredentials(req)).toBe(true);
    });

    it("returns true when Bearer token present", () => {
      const req = new Request("http://localhost/api/test", {
        headers: { authorization: "Bearer abc123" },
      });
      expect(hasCredentials(req)).toBe(true);
    });

    it("returns true when both present", () => {
      const req = new Request("http://localhost/api/test", {
        headers: {
          cookie: "solvit_session=abc123",
          authorization: "Bearer xyz",
        },
      });
      expect(hasCredentials(req)).toBe(true);
    });

    it("returns false when no credentials", () => {
      const req = new Request("http://localhost/api/test");
      expect(hasCredentials(req)).toBe(false);
    });

    it("returns false for empty Bearer", () => {
      const req = new Request("http://localhost/api/test", {
        headers: { authorization: "Bearer " },
      });
      expect(hasCredentials(req)).toBe(false);
    });

    it("returns false for non-Bearer auth scheme", () => {
      const req = new Request("http://localhost/api/test", {
        headers: { authorization: "Basic abc" },
      });
      expect(hasCredentials(req)).toBe(false);
    });
  });
});
