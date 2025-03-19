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
CREATE TABLE `restaurant_address` (
	`restaurant_id` text NOT NULL,
	`address_1` text,
	`address_2` text,
	`city` text,
	`state` text,
	`postal_code` text,
	`country` text,
	`lat` real,
	`lng` real,
	`geocode_metadata` text,
	`timezone` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `restaurant_address_restaurant_id_unique` ON `restaurant_address` (`restaurant_id`);--> statement-breakpoint
CREATE TABLE `restaurant_delivery_zone_map` (
	`restaurant_id` text NOT NULL,
	`zones` text,
	`min_lat` real,
	`max_lat` real,
	`min_lng` real,
	`max_lng` real
);
--> statement-breakpoint
CREATE UNIQUE INDEX `restaurant_delivery_zone_map_restaurant_id_unique` ON `restaurant_delivery_zone_map` (`restaurant_id`);--> statement-breakpoint
CREATE TABLE `restaurant_menu` (
	`restaurant_id` text NOT NULL,
	`menu_root` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `restaurant_menu_restaurant_id_unique` ON `restaurant_menu` (`restaurant_id`);--> statement-breakpoint
CREATE TABLE `restaurant_open_hours` (
	`restaurant_id` text NOT NULL,
	`open_hours` text,
	`delivery_hours` text,
	`pickup_hours` text,
	`on_premise_hours` text,
	`table_reservation_hours` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `restaurant_open_hours_restaurant_id_unique` ON `restaurant_open_hours` (`restaurant_id`);--> statement-breakpoint
CREATE TABLE `restaurant_payment_methods` (
	`restaurant_id` text NOT NULL,
	`default_payment_methods` text,
	`delivery_payment_methods` text,
	`pickup_payment_methods` text,
	`on_premise_payment_methods` text,
	`table_reservation_payment_methods` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `restaurant_payment_methods_restaurant_id_unique` ON `restaurant_payment_methods` (`restaurant_id`);--> statement-breakpoint
CREATE TABLE `restaurant_scheduled_orders_settings` (
	`restaurant_id` text NOT NULL,
	`is_scheduled_orders_enabled` integer DEFAULT false,
	`is_only_scheduled_orders_allowed` integer DEFAULT false,
	`pickup_min_time_in_advance_minutes` integer,
	`pickup_max_time_in_advance_minutes` integer,
	`delivery_min_time_in_advance_minutes` integer,
	`delivery_max_time_in_advance_minutes` integer,
	`pickup_settings` text,
	`delivery_settings` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `restaurant_scheduled_orders_settings_restaurant_id_unique` ON `restaurant_scheduled_orders_settings` (`restaurant_id`);--> statement-breakpoint
CREATE TABLE `restaurant` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text(510) NOT NULL,
	`default_phone_number` text,
	`extra_phone_numbers` text,
	`cuisines` text,
	`offers_pickup` integer DEFAULT false NOT NULL,
	`offers_delivery` integer DEFAULT false NOT NULL,
	`offers_on_premise` integer DEFAULT false NOT NULL,
	`offers_table_reservation` integer DEFAULT false NOT NULL,
	`owner_team_id` text NOT NULL,
	`support_team_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `restaurant_id_unique` ON `restaurant` (`id`);--> statement-breakpoint
CREATE TABLE `restaurant_table_reservation_settings` (
	`restaurant_id` text NOT NULL,
	`min_guests` integer,
	`max_guests` integer,
	`min_time_in_advance_minutes` integer,
	`max_time_in_advance_days` integer,
	`late_hold_time_minutes` integer,
	`allow_pre_order` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `restaurant_table_reservation_settings_restaurant_id_unique` ON `restaurant_table_reservation_settings` (`restaurant_id`);--> statement-breakpoint
CREATE TABLE `restaurant_tax_settings` (
	`restaurant_id` text NOT NULL,
	`currency` text,
	`sales_tax_type` text,
	`tax_name` text,
	`tax_rate_for_delivery` real,
	`tax_categories` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `restaurant_tax_settings_restaurant_id_unique` ON `restaurant_tax_settings` (`restaurant_id`);--> statement-breakpoint
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
CREATE TABLE `websites` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`default_hostname` text,
	`owner_team_id` text NOT NULL,
	`support_team_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `websites_id_unique` ON `websites` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `websites_default_hostname_unique` ON `websites` (`default_hostname`);