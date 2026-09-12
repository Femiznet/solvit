-- Step 1: convert text -> jsonb (existing PG array-literal strings become jsonb strings).
ALTER TABLE "projects" ALTER COLUMN "instructions" TYPE jsonb USING to_jsonb("instructions");--> statement-breakpoint
-- Step 2: unwrap jsonb strings holding PG array literals into real jsonb arrays.
-- (Fresh databases contain no rows at migration time, so this only affects DBs
-- seeded while instructions was still a text column.)
UPDATE "projects" SET "instructions" = to_jsonb(("instructions" #>> '{}')::text[]) WHERE jsonb_typeof("instructions") = 'string';--> statement-breakpoint
ALTER TABLE "project_difficulty_votes" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "project_difficulty_votes" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "project_difficulty_votes" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "project_difficulty_votes" ALTER COLUMN "updated_at" SET DEFAULT now();