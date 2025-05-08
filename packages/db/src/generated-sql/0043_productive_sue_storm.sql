CREATE TABLE `autoprint_device_task` (
	`created_at_ts` integer NOT NULL,
	`task_id` text PRIMARY KEY NOT NULL,
	`autoprint_device_id` text NOT NULL,
	`printer_name` text NOT NULL,
	`copies` integer DEFAULT 1 NOT NULL,
	`store_id` text NOT NULL,
	`order_id` text NOT NULL,
	`html` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `autoprint_device_task_task_id_unique` ON `autoprint_device_task` (`task_id`);