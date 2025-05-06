CREATE TABLE `order_status_history` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`new_status` text NOT NULL,
	`changed_by_user_id` text,
	`changed_by_ip_address` text,
	`change_method` text,
	`change_reason` text,
	`meta_data` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_status_history_id_unique` ON `order_status_history` (`id`);