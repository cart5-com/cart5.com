ALTER TABLE `order_status_history` ADD `type` text;--> statement-breakpoint
ALTER TABLE `order_status_history` DROP COLUMN `change_method`;--> statement-breakpoint
ALTER TABLE `order_status_history` DROP COLUMN `change_reason`;