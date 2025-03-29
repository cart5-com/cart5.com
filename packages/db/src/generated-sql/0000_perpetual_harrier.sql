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
CREATE TABLE `geocoding_cache` (
	`url` text PRIMARY KEY NOT NULL,
	`response` text,
	`created_at_ts` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `geocoding_cache_url_unique` ON `geocoding_cache` (`url`);--> statement-breakpoint
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
CREATE TABLE `store` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text(510) NOT NULL,
	`default_phone_number` text,
	`extra_phone_numbers` text,
	`cuisines` text,
	`offers_pickup` integer DEFAULT false NOT NULL,
	`offers_delivery` integer DEFAULT false NOT NULL,
	`owner_team_id` text NOT NULL,
	`support_team_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_id_unique` ON `store` (`id`);--> statement-breakpoint
CREATE TABLE `store_tax_settings` (
	`store_id` text NOT NULL,
	`currency` text,
	`currency_symbol` text,
	`sales_tax_type` text,
	`tax_name` text,
	`tax_rate_for_delivery` real,
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
	`is_partner` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `websites_id_unique` ON `websites` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `websites_default_hostname_unique` ON `websites` (`default_hostname`);