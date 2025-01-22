CREATE TABLE `gpus` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manufacturer` text NOT NULL,
	`name` text NOT NULL,
	`tdp` integer
);
