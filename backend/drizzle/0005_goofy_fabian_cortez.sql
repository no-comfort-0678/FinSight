ALTER TABLE "reminders" DROP CONSTRAINT "reminders_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "reminders" ADD COLUMN "description" varchar(500);--> statement-breakpoint
ALTER TABLE "reminders" ADD COLUMN "remind_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "reminders" ADD COLUMN "is_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "room_id" integer;--> statement-breakpoint
ALTER TABLE "reminders" DROP COLUMN "reminder_date";--> statement-breakpoint
ALTER TABLE "reminders" DROP COLUMN "reminder_time";--> statement-breakpoint
ALTER TABLE "reminders" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "reminders" DROP COLUMN "notified";