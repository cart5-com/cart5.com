CREATE TABLE `store_service_fees` (
	`store_id` text NOT NULL,
	`calculation_type` text,
	`tolerable_service_fee_rate` real,
	`offer_discount_if_possible` integer DEFAULT false NOT NULL,
	`custom_service_fees` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_service_fees_store_id_unique` ON `store_service_fees` (`store_id`);--> statement-breakpoint
ALTER TABLE `store_menu` DROP COLUMN `calculation_type`;--> statement-breakpoint
ALTER TABLE `store_menu` DROP COLUMN `included_service_fee_rate`;--> statement-breakpoint
ALTER TABLE `store_menu` DROP COLUMN `offer_discount_if_possible`;