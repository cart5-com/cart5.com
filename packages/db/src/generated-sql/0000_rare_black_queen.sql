CREATE TABLE `session` (
	`created_at_ts` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`hostname` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`is_email_verified` integer DEFAULT false NOT NULL,
	`name` text,
	`password_hash` text,
	`picture_url` text,
	`encrypted_two_factor_auth_key` blob,
	`encrypted_two_factor_auth_recovery_code` blob
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verified_phone_number` (
	`created_at_ts` integer NOT NULL,
	`user_id` text NOT NULL,
	`phone_number` text NOT NULL,
	PRIMARY KEY(`user_id`, `phone_number`)
);
--> statement-breakpoint
CREATE TABLE `autoprint_device_store_map` (
	`autoprint_device_id` text NOT NULL,
	`store_id` text NOT NULL,
	PRIMARY KEY(`autoprint_device_id`, `store_id`)
);
--> statement-breakpoint
CREATE TABLE `autoprint_device` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`autoprint_device_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`secret_key` text NOT NULL,
	`printers` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `autoprint_device_autoprint_device_id_unique` ON `autoprint_device` (`autoprint_device_id`);--> statement-breakpoint
CREATE TABLE `autoprint_device_task` (
	`created_at_ts` integer NOT NULL,
	`task_id` text PRIMARY KEY NOT NULL,
	`autoprint_device_id` text NOT NULL,
	`device_name` text NOT NULL,
	`copies` integer DEFAULT 1 NOT NULL,
	`store_id` text NOT NULL,
	`order_id` text NOT NULL,
	`html` text,
	`auto_accept_order_after_print` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `autoprint_device_task_task_id_unique` ON `autoprint_device_task` (`task_id`);--> statement-breakpoint
CREATE TABLE `geocoding_cache` (
	`url` text PRIMARY KEY NOT NULL,
	`response` text,
	`created_at_ts` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `geocoding_cache_url_unique` ON `geocoding_cache` (`url`);--> statement-breakpoint
CREATE TABLE `order_online_payment_flags` (
	`order_id` text PRIMARY KEY NOT NULL,
	`is_online_payment_verified` integer,
	`is_online_payment_captured` integer,
	`is_online_payment_cancelled_or_refunded` integer,
	`is_online_payment_not_verified_email_notification_sent` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_online_payment_flags_order_id_unique` ON `order_online_payment_flags` (`order_id`);--> statement-breakpoint
CREATE TABLE `order_status_history` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`new_status` text NOT NULL,
	`type` text,
	`changed_by_user_id` text,
	`changed_by_ip_address` text,
	`meta_data` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_status_history_id_unique` ON `order_status_history` (`id`);--> statement-breakpoint
CREATE TABLE `order_stripe_data` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`order_id` text PRIMARY KEY NOT NULL,
	`checkout_session_id` text,
	`payment_intent_id` text,
	`store_stripe_connect_account_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_stripe_data_order_id_unique` ON `order_stripe_data` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`real_created_at_ts` integer DEFAULT 0 NOT NULL,
	`order_id` text PRIMARY KEY NOT NULL,
	`short_otp` text NOT NULL,
	`order_type` text,
	`order_note` text,
	`order_status` text DEFAULT 'CREATED' NOT NULL,
	`user_id` text NOT NULL,
	`user_name` text DEFAULT '' NOT NULL,
	`user_email` text NOT NULL,
	`user_verified_phone_number` text NOT NULL,
	`website_id` text NOT NULL,
	`website_default_hostname` text NOT NULL,
	`support_team_website_id` text,
	`support_team_website_default_hostname` text,
	`store_id` text NOT NULL,
	`store_name` text NOT NULL,
	`store_address1` text NOT NULL,
	`store_location_lat` real NOT NULL,
	`store_location_lng` real NOT NULL,
	`store_timezone` text,
	`pickup_nickname` text NOT NULL,
	`payment_id` text NOT NULL,
	`is_online_payment` integer DEFAULT false NOT NULL,
	`final_amount` real NOT NULL,
	`payment_method_json` text,
	`estimated_time_json` text,
	`ordered_items_json` text,
	`cart_total_json` text,
	`subtotal_json` text,
	`cart_breakdown_json` text,
	`delivery_address_json` text,
	`tax_settings_json` text,
	`current_cart_json` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_id_unique` ON `orders` (`order_id`);--> statement-breakpoint
CREATE TABLE `store_address` (
	`store_id` text NOT NULL,
	`address_1` text,
	`address_2` text,
	`city` text,
	`state` text,
	`postal_code` text,
	`country` text,
	`lat` real,
	`lng` real
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_address_store_id_unique` ON `store_address` (`store_id`);--> statement-breakpoint
CREATE TABLE `store_as_a_stripe_customer` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`store_id` text NOT NULL,
	`stripe_customer_id` text,
	`has_chargable_payment_method` integer DEFAULT false NOT NULL,
	`last_verified_payment_method_id` text,
	`payment_method_details` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_as_a_stripe_customer_store_id_unique` ON `store_as_a_stripe_customer` (`store_id`);--> statement-breakpoint
CREATE TABLE `store_automation_rules` (
	`store_id` text NOT NULL,
	`auto_accept_order_after_print` integer DEFAULT false NOT NULL,
	`auto_print_rules` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_automation_rules_store_id_unique` ON `store_automation_rules` (`store_id`);--> statement-breakpoint
CREATE TABLE `store_delivery_zone_map` (
	`store_id` text NOT NULL,
	`zones` text,
	`min_lat` real,
	`max_lat` real,
	`min_lng` real,
	`max_lng` real
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_delivery_zone_map_store_id_unique` ON `store_delivery_zone_map` (`store_id`);--> statement-breakpoint
CREATE TABLE `store_menu` (
	`store_id` text NOT NULL,
	`menu_root` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_menu_store_id_unique` ON `store_menu` (`store_id`);--> statement-breakpoint
CREATE TABLE `store_open_hours` (
	`store_id` text NOT NULL,
	`timezone` text,
	`open_hours` text,
	`delivery_hours` text,
	`pickup_hours` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_open_hours_store_id_unique` ON `store_open_hours` (`store_id`);--> statement-breakpoint
CREATE TABLE `store_payment_methods` (
	`store_id` text NOT NULL,
	`default_payment_methods` text,
	`delivery_payment_methods` text,
	`pickup_payment_methods` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_payment_methods_store_id_unique` ON `store_payment_methods` (`store_id`);--> statement-breakpoint
CREATE TABLE `store_recently_updated` (
	`store_id` text NOT NULL,
	`created_at_ts` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_recently_updated_store_id_unique` ON `store_recently_updated` (`store_id`);--> statement-breakpoint
CREATE TABLE `store_service_fees` (
	`store_id` text NOT NULL,
	`calculation_type` text,
	`tolerable_service_fee_rate` real,
	`offer_discount_if_possible` integer DEFAULT false NOT NULL,
	`custom_service_fees` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_service_fees_store_id_unique` ON `store_service_fees` (`store_id`);--> statement-breakpoint
CREATE TABLE `store_stripe_connect_settings` (
	`store_id` text NOT NULL,
	`stripe_connect_account_id` text,
	`is_stripe_enabled` integer DEFAULT false NOT NULL,
	`stripe_rate_per_order` real,
	`stripe_fee_per_order` real,
	`who_pays_stripe_fee` text DEFAULT 'STORE' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_stripe_connect_settings_store_id_unique` ON `store_stripe_connect_settings` (`store_id`);--> statement-breakpoint
CREATE TABLE `store` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text(510) NOT NULL,
	`default_phone_number` text,
	`extra_phone_numbers` text,
	`cuisines` text,
	`offers_pickup` integer DEFAULT false NOT NULL,
	`default_estimated_pickup_time` text,
	`offers_delivery` integer DEFAULT false NOT NULL,
	`default_estimated_delivery_time` text,
	`owner_team_id` text NOT NULL,
	`support_team_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_id_unique` ON `store` (`id`);--> statement-breakpoint
CREATE TABLE `store_tax_settings` (
	`store_id` text NOT NULL,
	`currency` text,
	`sales_tax_type` text,
	`tax_name` text,
	`tax_rate_for_delivery` real,
	`tax_rate_for_service_fees` real,
	`tax_categories` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_tax_settings_store_id_unique` ON `store_tax_settings` (`store_id`);--> statement-breakpoint
CREATE TABLE `team_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`team_name` text NOT NULL,
	`inviter_id` text NOT NULL,
	`email` text NOT NULL,
	`permissions` text,
	`status` text NOT NULL,
	`accepted_at_ts` integer,
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_invitations_id_unique` ON `team_invitations` (`id`);--> statement-breakpoint
CREATE TABLE `team` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`owner_user_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_id_unique` ON `team` (`id`);--> statement-breakpoint
CREATE TABLE `team_user_map` (
	`team_id` text NOT NULL,
	`user_id` text NOT NULL,
	`permissions` text,
	PRIMARY KEY(`team_id`, `user_id`)
);
--> statement-breakpoint
CREATE TABLE `user_as_a_stripe_customer` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`user_id` text NOT NULL,
	`stripe_customer_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `stripe_customer_id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_as_a_stripe_customer_user_id_unique` ON `user_as_a_stripe_customer` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_as_a_stripe_customer_stripe_customer_id_unique` ON `user_as_a_stripe_customer` (`stripe_customer_id`);--> statement-breakpoint
CREATE TABLE `user_data` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`user_id` text NOT NULL,
	`remember_last_lat` real,
	`remember_last_lng` real,
	`remember_last_address` text,
	`remember_last_country` text,
	`remember_last_order_type` text,
	`remember_last_nickname` text,
	`remember_last_address_id` text,
	`addresses` text,
	`remember_last_payment_method_id` text,
	`carts` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_data_user_id_unique` ON `user_data` (`user_id`);--> statement-breakpoint
CREATE TABLE `partner_store_map` (
	`website_id` text NOT NULL,
	`store_id` text NOT NULL,
	`override_partner_fee` text,
	PRIMARY KEY(`website_id`, `store_id`)
);
--> statement-breakpoint
CREATE TABLE `website_domain_map` (
	`hostname` text NOT NULL,
	`website_id` text NOT NULL,
	PRIMARY KEY(`hostname`, `website_id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `website_domain_map_hostname_unique` ON `website_domain_map` (`hostname`);--> statement-breakpoint
CREATE TABLE `website_store_map` (
	`website_id` text NOT NULL,
	`store_id` text NOT NULL,
	`override_marketplace_fee` text,
	PRIMARY KEY(`website_id`, `store_id`)
);
--> statement-breakpoint
CREATE TABLE `websites` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`default_hostname` text,
	`owner_team_id` text NOT NULL,
	`support_team_id` text,
	`is_marketplace` integer DEFAULT true NOT NULL,
	`default_marketplace_fee` text,
	`is_partner` integer DEFAULT false NOT NULL,
	`default_partner_fee` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `websites_id_unique` ON `websites` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `websites_default_hostname_unique` ON `websites` (`default_hostname`);