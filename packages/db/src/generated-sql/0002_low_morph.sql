ALTER TABLE `websites` ADD `is_marketplace` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `websites` DROP COLUMN `marketplace_mode`;