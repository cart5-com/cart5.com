ALTER TABLE `orders` ADD `order_accepted_at_ts` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `order_completed_at_ts` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `order_cancelled_at_ts` integer;