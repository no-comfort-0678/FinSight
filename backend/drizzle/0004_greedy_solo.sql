ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "ledger_entries" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "ledger_entries" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "split_members" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "split_members" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "splits" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "splits" ALTER COLUMN "id" DROP IDENTITY;