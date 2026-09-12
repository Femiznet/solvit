-- HAND-OWNED MIGRATION (0003): project full-text search.
-- Do NOT regenerate with `drizzle-kit generate`: it cannot emit the helper
-- function, the GENERATED ALWAYS expression, or the GIN index. If `generate`
-- produces a diff touching search_vector, reconcile the snapshot in favour
-- of this file.
--> statement-breakpoint
CREATE OR REPLACE FUNCTION jsonb_array_to_text(input jsonb)
RETURNS text LANGUAGE sql IMMUTABLE AS
$$ SELECT coalesce(string_agg(elem, ' '), '') FROM jsonb_array_elements_text(coalesce(input, '[]'::jsonb)) AS elem $$;
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "search_vector" tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce("name", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("description", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(jsonb_array_to_text("requirements"), '')), 'C') ||
  setweight(to_tsvector('simple', coalesce(jsonb_array_to_text("opt_requirements"), '')), 'C') ||
  setweight(to_tsvector('simple', coalesce(jsonb_array_to_text("instructions"), '')), 'D')
) STORED;
--> statement-breakpoint
CREATE INDEX "projects_search_vector_gin_idx" ON "projects" USING gin ("search_vector");