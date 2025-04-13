ALTER TABLE `store_menu` ADD `calculation_type` text;--> statement-breakpoint
ALTER TABLE `store_menu` ADD `included_service_fee_rate` real;--> statement-breakpoint
ALTER TABLE `store_menu` ADD `offer_discount_if_possible` integer DEFAULT false NOT NULL;