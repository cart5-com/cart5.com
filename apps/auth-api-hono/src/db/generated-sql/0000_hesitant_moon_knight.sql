CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`hostname` text NOT NULL,
	`created_at_ts` integer NOT NULL,
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
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);