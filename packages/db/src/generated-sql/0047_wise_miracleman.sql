ALTER TABLE `orders` ADD `store_timezone` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `estimated_time_json` text;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `estimated_time_text`;