import { db } from "@/database";
import { projectBookMarks } from "@/database/schemas";
import { and, eq } from "drizzle-orm";
import { SelectProjectBookmarkInput } from "@/zod-validators/zod-project-bookmarks";

export async function toggleProjectBookmarkService({
  userId,
  projectId,
}: SelectProjectBookmarkInput) {
  const existingBookmark = await db().query.projectBookMarks.findFirst({
    where: and(eq(projectBookMarks.userId, userId), eq(projectBookMarks.projectId, projectId)),
  });

  if (existingBookmark) {
    await db().delete(projectBookMarks).where(eq(projectBookMarks.id, existingBookmark.id));
    return { bookmarked: false };
  } else {
    await db().insert(projectBookMarks).values({
      userId,
      projectId,
    });
    return { bookmarked: true };
  }
}
