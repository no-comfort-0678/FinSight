CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_name" varchar(255) NOT NULL,
	"members" varchar,
	"owner_id" integer,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "split_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"split_id" integer,
	"room_id" integer,
	"username" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"is_locked" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "splits" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer,
	"description" varchar(255) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"paid_by" varchar(255) NOT NULL,
	"split_type" varchar(50) DEFAULT 'equal',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "reminders" ADD COLUMN "reminder_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "reminders" ADD COLUMN "reminder_time" time NOT NULL;--> statement-breakpoint
ALTER TABLE "reminders" ADD COLUMN "amount" numeric(15, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "reminders" ADD COLUMN "notified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "split_members" ADD CONSTRAINT "split_members_split_id_splits_id_fk" FOREIGN KEY ("split_id") REFERENCES "public"."splits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "splits" ADD CONSTRAINT "splits_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "reminders" DROP COLUMN "remind_at";--> statement-breakpoint
ALTER TABLE "reminders" DROP COLUMN "is_completed";