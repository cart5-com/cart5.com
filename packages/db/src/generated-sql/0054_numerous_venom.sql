CREATE TABLE `order_stripe_data` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`order_id` text PRIMARY KEY NOT NULL,
	`checkout_session_id` text,
	`checkout_session_status` text,
	`payment_intent_id` text,
	`payment_intent_status` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_stripe_data_order_id_unique` ON `order_stripe_data` (`order_id`);