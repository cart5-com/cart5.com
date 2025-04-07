CREATE TABLE `store_recently_updated` (
	`store_id` text NOT NULL,
	`created_at_ts` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_recently_updated_store_id_unique` ON `store_recently_updated` (`store_id`);