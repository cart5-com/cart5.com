CREATE TABLE `store_automation_rules` (
	`store_id` text NOT NULL,
	`auto_accept_order_after_print` integer DEFAULT false NOT NULL,
	`auto_print_rules` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_automation_rules_store_id_unique` ON `store_automation_rules` (`store_id`);