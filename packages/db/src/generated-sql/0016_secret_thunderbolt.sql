CREATE TABLE `store_stripe_private_data` (
	`store_id` text NOT NULL,
	`stripe_connect_account_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_stripe_private_data_store_id_unique` ON `store_stripe_private_data` (`store_id`);