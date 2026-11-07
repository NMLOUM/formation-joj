CREATE TABLE "places" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"visit_minutes" integer NOT NULL,
	CONSTRAINT "places_visit_minutes_check" CHECK ("places"."visit_minutes" >= 1)
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "sites_name_key" ON "sites" USING btree ("name");