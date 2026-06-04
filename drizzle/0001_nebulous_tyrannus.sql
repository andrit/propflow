ALTER TABLE "proposals" ADD COLUMN "proposal_type" text DEFAULT 'cold' NOT NULL;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "root_proposal_id" text;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "superseded_by_id" text;