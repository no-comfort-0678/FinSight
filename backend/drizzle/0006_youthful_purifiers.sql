ALTER TABLE "reminders" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "category" varchar(100);--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "category" varchar(100) DEFAULT 'Other';