ALTER TABLE `order_online_payment_flags` ADD `is_online_payment_captured` integer;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `is_online_payment_captured`;