CREATE TABLE `store_as_a_stripe_customer` (
	`store_id` text NOT NULL,
	`stripe_customer_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_as_a_stripe_customer_store_id_unique` ON `store_as_a_stripe_customer` (`store_id`);