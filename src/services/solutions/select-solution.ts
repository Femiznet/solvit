// import { db } from "@/database";
// import { projects } from "@/database/schemas";
// import { eq } from "drizzle-orm";
// import { ServiceArgs } from "@/types";

// export type SelectProjectInput = {
//   projectId: string;
// };

// export type SelectUserProjectInput = {
//   userId: string;
// }

// export async function selectSingleProjectService({
//   input,
//   tx,
// }: ServiceArgs<SelectProjectInput>) {
//   const [project] = await db(tx).select().from(projects).where(eq(projects.id, input.projectId));

//   return project || null;
// }

// export async function selectUserProjectsService({ input }: ServiceArgs<SelectUserProjectInput>){
//   const userProjects = await db().select().from(projects).where(
//     eq(projects.userId, input.userId)
//   )
//   return userProjects;
// }

// export async function selectManyProjectsService(args?: { tx?: ServiceArgs<never>["tx"] }) {
//   const { tx } = args || {};

//   return await db(tx).select().from(projects);
// }

import { db } from "@/database";
import { projects, solutions } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export type SelectSolutionInput = {
  solutionId: string;
};

export type SelectUserSolutiontInput = {
  userId: string;
};

export async function selectSingleSolutionService({
  input: { solutionId },
  tx,
}: ServiceArgs<SelectSolutionInput>) {
  const [result] = await db(tx)
    .select()
    .from(solutions)
    .leftJoin(projects, eq(solutions.projectId, projects.id))
    .where(eq(solutions.id, solutionId));

  if (!result) {
    return null;
  }

  return {
    ...result.solutions,
    project: result.projects || null,
  };
}

export async function selectUserSolutionsService({
  input,
  tx,
}: ServiceArgs<SelectUserSolutiontInput>) {
  const results = await db(tx)
    .select()
    .from(solutions)
    .leftJoin(projects, eq(solutions.projectId, projects.id))
    .where(eq(solutions.userId, input.userId));

  return results.map((row) => ({
    ...row.solutions,
    project: row.projects || null,
  }));
}

export async function selectManySolutionsService(args?: { tx?: ServiceArgs<never>["tx"] }) {
  const { tx } = args || {};

  return await db(tx).select().from(solutions);
}
