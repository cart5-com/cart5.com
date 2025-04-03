CREATE TABLE `user_data` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`user_id` text NOT NULL,
	`remember_last_address_id` text,
	`addresses` text DEFAULT '[]'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_data_user_id_unique` ON `user_data` (`user_id`);