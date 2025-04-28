ALTER TABLE `store_as_a_stripe_customer` ADD `created_at_ts` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `store_as_a_stripe_customer` ADD `updated_at_ts` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `store_as_a_stripe_customer` ADD `has_chargable_payment_method` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `store_as_a_stripe_customer` ADD `last_verified_payment_method_id` text;