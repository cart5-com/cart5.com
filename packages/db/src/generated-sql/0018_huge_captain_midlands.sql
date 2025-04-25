ALTER TABLE `store_stripe_settings_data` ADD `is_stripe_enabled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `store_stripe_settings_data` ADD `stripe_rate_per_order` real;--> statement-breakpoint
ALTER TABLE `store_stripe_settings_data` ADD `stripe_fee_per_order` real;--> statement-breakpoint
ALTER TABLE `store_stripe_settings_data` ADD `who_pays_stripe_fee` text DEFAULT 'STORE' NOT NULL;