import { describe, expect, it } from "vitest";
import {
  createSolutionSchema,
  updateSolutionSchema,
} from "@/zod-validators/zod-solutions";
import {
  getSolutionUrlTrust,
  isAllowedRepoHost,
  isSafeDemoUrl,
  isTrustedDemoHost,
} from "@/constants/solution-urls";

const base = {
  projectId: "33333333-3333-4333-8333-333333333333",
  userId: "11111111-1111-4111-8111-111111111111",
  title: "My solution",
  implFeat: ["feature one"],
};

describe("solution url allowlist", () => {
  it("accepts popular repo hosts", () => {
    for (const repoUrl of [
      "https://github.com/ada/solvit-todo",
      "https://gist.github.com/ada/abc123",
      "https://gitlab.com/ada/solvit-todo",
      "https://bitbucket.org/ada/solvit-todo",
      "https://codeberg.org/ada/solvit-todo",
      "https://git.sr.ht/~ada/solvit-todo",
      "https://dev.azure.com/ada/solvit/_git/todo",
      "https://ada.visualstudio.com/solvit/_git/todo",
    ]) {
      expect(isAllowedRepoHost(repoUrl)).toBe(true);
      expect(
        createSolutionSchema.safeParse({ ...base, repoUrl }).success
      ).toBe(true);
    }
  });

  it("rejects non-git / lookalike repo hosts", () => {
    for (const repoUrl of [
      "https://github.com.evil.com/ada/todo",
      "https://evil-github.com/ada/todo",
      "https://my-blog.com/ada/todo",
      "http://github.com/ada/todo",
      "https://localhost:3000/ada/todo",
    ]) {
      expect(isAllowedRepoHost(repoUrl)).toBe(false);
      const result = createSolutionSchema.safeParse({ ...base, repoUrl });
      expect(result.success).toBe(false);
    }
  });

  it("accepts popular demo hosts and custom domains, rejects private urls", () => {
    for (const demoUrl of [
      "https://my-todo.vercel.app",
      "https://my-todo.netlify.app",
      "https://ada.github.io/solvit-todo/",
      "https://my-todo.pages.dev",
      "https://todo-ada.web.app",
      "https://my-solution.onrender.com",
      "https://codepen.io/ada/pen/abc",
      "https://ada-portfolio.com/projects/todo",
    ]) {
      expect(isSafeDemoUrl(demoUrl)).toBe(true);
      expect(
        createSolutionSchema.safeParse({ ...base, demoUrl }).success
      ).toBe(true);
    }

    for (const demoUrl of [
      "http://my-todo.vercel.app",
      "http://localhost:3000",
      "https://127.0.0.1:3000/demo",
      "https://192.168.1.10/demo",
      "https://10.0.0.5/demo",
      "https://172.16.0.5/demo",
      "https://intranet/demo",
      "javascript:alert(1)",
    ]) {
      expect(isSafeDemoUrl(demoUrl)).toBe(false);
      expect(createSolutionSchema.safeParse({ ...base, demoUrl }).success).toBe(
        false
      );
    }
  });

  it("marks trusted demo hosts for badge, custom domains as custom", () => {
    expect(isTrustedDemoHost("https://my-todo.vercel.app")).toBe(true);
    expect(isTrustedDemoHost("https://my-todo.netlify.app")).toBe(true);
    expect(isTrustedDemoHost("https://ada.github.io/todo")).toBe(true);
    expect(getSolutionUrlTrust("https://my-todo.vercel.app", "demo")).toEqual({
      kind: "demo",
      trusted: true,
    });
    expect(getSolutionUrlTrust("https://ada-portfolio.com/todo", "demo")).toEqual({
      kind: "custom",
      trusted: false,
    });
  });

  it("still allows null urls and validates updates", () => {
    expect(
      createSolutionSchema.safeParse({ ...base, repoUrl: null, demoUrl: null })
        .success
    ).toBe(true);
    expect(
      updateSolutionSchema.safeParse({
        solutionId: "55555555-5555-4555-8555-555555555555",
        userId: base.userId,
        repoUrl: "https://my-blog.com/ada/todo",
      }).success
    ).toBe(false);
  });
});
