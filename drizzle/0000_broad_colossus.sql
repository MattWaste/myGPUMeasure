CREATE TABLE "gpus" (
	"id" serial PRIMARY KEY NOT NULL,
	"manufacturer" text NOT NULL,
	"name" text NOT NULL,
	"tdp" integer
);
