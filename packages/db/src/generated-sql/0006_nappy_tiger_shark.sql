CREATE TABLE `partner_store_map` (
	`website_id` text NOT NULL,
	`store_id` text NOT NULL,
	`override_partner_fee` text,
	PRIMARY KEY(`website_id`, `store_id`)
);
