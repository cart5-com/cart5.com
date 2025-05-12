CREATE TABLE `user_as_a_stripe_customer` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`user_id` text NOT NULL,
	`stripe_customer_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `stripe_customer_id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_as_a_stripe_customer_user_id_unique` ON `user_as_a_stripe_customer` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_as_a_stripe_customer_stripe_customer_id_unique` ON `user_as_a_stripe_customer` (`stripe_customer_id`);