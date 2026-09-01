CREATE TYPE "public"."project_level" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED');--> statement-breakpoint
CREATE TABLE "project_stacks" (
	"project_id" uuid NOT NULL,
	"stack_id" uuid NOT NULL,
	CONSTRAINT "project_stacks_project_id_stack_id_pk" PRIMARY KEY("project_id","stack_id")
);
--> statement-breakpoint
CREATE TABLE "stacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "stacks_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "opt_feat" TO "opt_requirements";--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "exp_feat" TO "requirements";--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "level" "project_level" DEFAULT 'BEGINNER' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "instructions" text;--> statement-breakpoint
ALTER TABLE "project_stacks" ADD CONSTRAINT "project_stacks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_stacks" ADD CONSTRAINT "project_stacks_stack_id_stacks_id_fk" FOREIGN KEY ("stack_id") REFERENCES "public"."stacks"("id") ON DELETE cascade ON UPDATE no action;