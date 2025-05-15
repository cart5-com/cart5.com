CREATE TABLE `order_online_payment_flags` (
	`order_id` text PRIMARY KEY NOT NULL,
	`is_online_payment_not_verified_email_notification_sent` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_online_payment_flags_order_id_unique` ON `order_online_payment_flags` (`order_id`);--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `is_online_payment_not_verified_email_notification_sent`;