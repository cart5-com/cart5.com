CREATE TABLE `team` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner_user_id` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_id_unique` ON `team` (`id`);--> statement-breakpoint
CREATE TABLE `team_user_map` (
	`team_id` text NOT NULL,
	`user_id` text NOT NULL,
	`permissions` text,
	PRIMARY KEY(`team_id`, `user_id`)
);
--> statement-breakpoint
DROP TABLE `website_user_admins_map`;--> statement-breakpoint
ALTER TABLE `websites` ADD `owner_team_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `websites` ADD `support_team_id` text;--> statement-breakpoint
ALTER TABLE `websites` DROP COLUMN `owner_user_id`;