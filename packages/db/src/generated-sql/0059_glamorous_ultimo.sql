ALTER TABLE `orders` ADD `is_online_payment_cancelled_or_refunded` integer;--> statement-breakpoint
ALTER TABLE `order_stripe_data` DROP COLUMN `checkout_session_status`;--> statement-breakpoint
ALTER TABLE `order_stripe_data` DROP COLUMN `payment_intent_status`;--> statement-breakpoint
ALTER TABLE `order_stripe_data` DROP COLUMN `charge_id`;