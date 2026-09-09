import { db } from "@/database";
import { solutionBookMarks } from "@/database/schemas";
import { SelectSolutionBookmarkInput } from "@/zod-validators/zod-project-bookmarks";
import { and, eq } from "drizzle-orm";

export async function toggleSolutionBookmarkService({
  userId,
  solutionId,
}: SelectSolutionBookmarkInput) {
  const existingBookmark = await db().query.solutionBookMarks.findFirst({
    where: and(eq(solutionBookMarks.userId, userId), eq(solutionBookMarks.solutionId, solutionId)),
  });

  if (existingBookmark) {
    await db().delete(solutionBookMarks).where(eq(solutionBookMarks.id, existingBookmark.id));
    return { bookmarked: false };
  } else {
    await db().insert(solutionBookMarks).values({
      userId,
      solutionId,
    });
    return { bookmarked: true };
  }
}
