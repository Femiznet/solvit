import { z } from "zod";

// User-content lists (solutions, user solutions/bookmarks/likes): default 20, max 50.
export const paginationSchema = z.object({
  limit: z.coerce
    .number()
    .int({ error: "Limit must be a whole number" })
    .min(1, { error: "Limit must be at least 1" })
    .max(50, { error: "Limit cannot exceed 50" })
    .default(20),
  offset: z.coerce
    .number()
    .int({ error: "Offset must be a whole number" })
    .min(0, { error: "Offset cannot be negative" })
    .default(0),
});

// Taxonomy tables (stacks, categories): default 50, max 100.
export const taxonomyPaginationSchema = z.object({
  limit: z.coerce
    .number()
    .int({ error: "Limit must be a whole number" })
    .min(1, { error: "Limit must be at least 1" })
    .max(100, { error: "Limit cannot exceed 100" })
    .default(50),
  offset: z.coerce
    .number()
    .int({ error: "Offset must be a whole number" })
    .min(0, { error: "Offset cannot be negative" })
    .default(0),
});

// Embedded solutions on GET /api/projects/{id}: solutionsLimit / solutionsOffset.
export const projectDetailPaginationSchema = z.object({
  solutionsLimit: z.coerce
    .number()
    .int({ error: "solutionsLimit must be a whole number" })
    .min(1, { error: "solutionsLimit must be at least 1" })
    .max(50, { error: "solutionsLimit cannot exceed 50" })
    .default(10),
  solutionsOffset: z.coerce
    .number()
    .int({ error: "solutionsOffset must be a whole number" })
    .min(0, { error: "solutionsOffset cannot be negative" })
    .default(0),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type TaxonomyPaginationInput = z.infer<typeof taxonomyPaginationSchema>;
export type ProjectDetailPaginationInput = z.infer<typeof projectDetailPaginationSchema>;
