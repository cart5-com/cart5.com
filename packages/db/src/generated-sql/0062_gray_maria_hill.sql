ALTER TABLE `order_online_payment_flags` ADD `is_online_payment_cancelled_or_refunded` integer;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `is_online_payment_cancelled_or_refunded`;