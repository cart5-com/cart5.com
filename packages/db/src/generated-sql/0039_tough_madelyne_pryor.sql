CREATE TABLE `autoprint_device` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`autoprint_device_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`secret_key` text NOT NULL,
	`printers` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `autoprint_device_autoprint_device_id_unique` ON `autoprint_device` (`autoprint_device_id`);