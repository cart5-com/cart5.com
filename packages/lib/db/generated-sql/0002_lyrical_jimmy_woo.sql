DROP TABLE `restaurant_user_admins_map`;--> statement-breakpoint
ALTER TABLE `restaurant` ADD `owner_team_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurant` ADD `support_team_id` text;--> statement-breakpoint
ALTER TABLE `restaurant` DROP COLUMN `owner_user_id`;