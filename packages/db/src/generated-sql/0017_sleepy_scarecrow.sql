ALTER TABLE `store_stripe_private_data` RENAME TO `store_stripe_settings_data`;--> statement-breakpoint
DROP INDEX IF EXISTS `store_stripe_private_data_store_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `store_stripe_settings_data_store_id_unique` ON `store_stripe_settings_data` (`store_id`);