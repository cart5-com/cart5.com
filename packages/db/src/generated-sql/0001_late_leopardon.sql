CREATE TABLE `website_restaurant_map` (
	`website_id` text NOT NULL,
	`restaurant_id` text NOT NULL,
	PRIMARY KEY(`website_id`, `restaurant_id`)
);
--> statement-breakpoint
ALTER TABLE `websites` ADD `marketplace_mode` text NOT NULL;