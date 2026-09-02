CREATE TYPE "public"."project_difficulty" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED');--> statement-breakpoint
CREATE TABLE "project_difficulty_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"difficulty" "project_difficulty" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_project_difficulty_idx" UNIQUE("user_id","project_id")
);
--> statement-breakpoint
ALTER TABLE "user_project_progress" RENAME TO "user_progress";--> statement-breakpoint
ALTER TABLE "user_progress" DROP CONSTRAINT "user_project_progress_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_progress" DROP CONSTRAINT "user_project_progress_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "project_difficulty_votes" ADD CONSTRAINT "project_difficulty_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_difficulty_votes" ADD CONSTRAINT "project_difficulty_votes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" DROP COLUMN "started_at";--> statement-breakpoint
ALTER TABLE "user_progress" DROP COLUMN "completed_at";