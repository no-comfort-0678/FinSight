CREATE TYPE "public"."account_status" AS ENUM('active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."ledger_direction" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'reversed');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"username" varchar(50) NOT NULL,
	"upi_id" varchar(100) NOT NULL,
	"phone" varchar(15) NOT NULL,
	"email" varchar(150),
	"password_hash" varchar(255) NOT NULL,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"balance" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"status" "account_status" DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" varchar(64) NOT NULL,
	"sender_account_id" integer NOT NULL,
	"receiver_account_id" integer NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"status" "payment_status" DEFAULT 'pending',
	"description" varchar(255),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" varchar(64) NOT NULL,
	"account_id" integer NOT NULL,
	"direction" "ledger_direction" NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"balance_after" numeric(15, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" varchar(64) NOT NULL,
	"account_id" integer NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"vendor" varchar(255),
	"bill_date" date,
	"file_url" text,
	"file_hash" varchar(64) NOT NULL,
	"ocr_text" text,
	"status" varchar(32) DEFAULT 'completed',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "expenses_file_hash_unique" UNIQUE("file_hash")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_name" varchar(255) NOT NULL,
	"members" text NOT NULL,
	"owner_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "split_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"split_id" integer,
	"username" varchar(255) NOT NULL,
	"amount" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "splits" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" varchar(255) NOT NULL,
	"total_amount" double precision NOT NULL,
	"paid_by" varchar(255) NOT NULL,
	"room_id" integer,
	"split_type" varchar(50) DEFAULT 'manual',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_sender_account_id_accounts_id_fk" FOREIGN KEY ("sender_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_receiver_account_id_accounts_id_fk" FOREIGN KEY ("receiver_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split_members" ADD CONSTRAINT "split_members_split_id_splits_id_fk" FOREIGN KEY ("split_id") REFERENCES "public"."splits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "splits" ADD CONSTRAINT "splits_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_upi_id_idx" ON "users" USING btree ("upi_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_idx" ON "users" USING btree ("phone");