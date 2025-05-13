DROP INDEX IF EXISTS "user_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "autoprint_device_autoprint_device_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "autoprint_device_task_task_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "geocoding_cache_url_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "order_status_history_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "orders_order_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "store_address_store_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "store_as_a_stripe_customer_store_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "store_automation_rules_store_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "store_delivery_zone_map_store_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "store_menu_store_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "store_open_hours_store_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "store_payment_methods_store_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "store_recently_updated_store_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "store_service_fees_store_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "store_stripe_connect_settings_store_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "store_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "store_tax_settings_store_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "team_invitations_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "team_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "user_as_a_stripe_customer_user_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "user_as_a_stripe_customer_stripe_customer_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "user_data_user_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "website_domain_map_hostname_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "websites_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "websites_default_hostname_unique";--> statement-breakpoint
ALTER TABLE `orders` ALTER COLUMN "is_online_payment_verified" TO "is_online_payment_verified" integer;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `autoprint_device_autoprint_device_id_unique` ON `autoprint_device` (`autoprint_device_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `autoprint_device_task_task_id_unique` ON `autoprint_device_task` (`task_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `geocoding_cache_url_unique` ON `geocoding_cache` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `order_status_history_id_unique` ON `order_status_history` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_id_unique` ON `orders` (`order_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_address_store_id_unique` ON `store_address` (`store_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_as_a_stripe_customer_store_id_unique` ON `store_as_a_stripe_customer` (`store_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_automation_rules_store_id_unique` ON `store_automation_rules` (`store_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_delivery_zone_map_store_id_unique` ON `store_delivery_zone_map` (`store_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_menu_store_id_unique` ON `store_menu` (`store_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_open_hours_store_id_unique` ON `store_open_hours` (`store_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_payment_methods_store_id_unique` ON `store_payment_methods` (`store_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_recently_updated_store_id_unique` ON `store_recently_updated` (`store_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_service_fees_store_id_unique` ON `store_service_fees` (`store_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_stripe_connect_settings_store_id_unique` ON `store_stripe_connect_settings` (`store_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_id_unique` ON `store` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_tax_settings_store_id_unique` ON `store_tax_settings` (`store_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `team_invitations_id_unique` ON `team_invitations` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `team_id_unique` ON `team` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_as_a_stripe_customer_user_id_unique` ON `user_as_a_stripe_customer` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_as_a_stripe_customer_stripe_customer_id_unique` ON `user_as_a_stripe_customer` (`stripe_customer_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_data_user_id_unique` ON `user_data` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `website_domain_map_hostname_unique` ON `website_domain_map` (`hostname`);--> statement-breakpoint
CREATE UNIQUE INDEX `websites_id_unique` ON `websites` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `websites_default_hostname_unique` ON `websites` (`default_hostname`);