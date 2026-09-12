import { db } from "@/database";
import { categories, projects } from "@/database/schemas";
import { eq, count } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { ClientError } from "@/lib/errors";

export type DeleteCategoryInput = {
  categoryId: string;
};

export async function deleteCategoryService({
  input: { categoryId },
  tx,
}: ServiceArgs<DeleteCategoryInput>) {
  const activeDb = db(tx);

  // Guard: refuse to delete a category that still has projects assigned.
  // Without this, Postgres would cascade-delete every project in the category
  // (solutions, likes, bookmarks, difficulty votes, project_stacks go too).
  const [projectCount] = await activeDb
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.categoryId, categoryId));

  if (projectCount && projectCount.count > 0) {
    throw new ClientError(
      `Cannot delete category: ${projectCount.count} project(s) still use it. Reassign or delete them first.`
    );
  }

  const [deletedCategory] = await activeDb
    .delete(categories)
    .where(eq(categories.id, categoryId))
    .returning({
      id: categories.id,
      name: categories.name,
    });

  if (!deletedCategory) throw new ClientError("Category not found");

  return deletedCategory;
}
