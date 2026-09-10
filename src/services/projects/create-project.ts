// src/services/projects/create-project.ts
import { db } from "@/database";
import { projects } from "@/database/schemas";
import { projectCreationLogs } from "@/database/schemas/project-creation-logs";
import { RateLimitError } from "@/lib/errors";
import { ServiceArgs } from "@/types/service-args";
import { CreateProjectInput } from "@/zod-validators/zod-projects";
import { and, eq, gte, count, sql } from "drizzle-orm";

export async function createProjectService({ input, tx }: ServiceArgs<CreateProjectInput>) {
  const activeDb = db(tx);

  // Check creation logs for today (unaffected by project deletions)
  const [result] = await activeDb
    .select({ count: count() })
    .from(projectCreationLogs)
    .where(
      and(
        eq(projectCreationLogs.userId, input.userId),
        gte(projectCreationLogs.createdAt, sql`CURRENT_DATE`)
      )
    );

  if (result && result.count >= 2) {
    throw new RateLimitError("Daily project creation limit reached (maximum 2 projects per day).");
  }

  // Log the creation attempt
  await activeDb.insert(projectCreationLogs).values({
    userId: input.userId,
  });

  const [newProject] = await activeDb.insert(projects).values(input).returning({
    id: projects.id,
  });

  return newProject;
}
