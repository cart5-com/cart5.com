CREATE TABLE `autoprint_device_store_map` (
	`autoprint_device_id` text NOT NULL,
	`store_id` text NOT NULL,
	PRIMARY KEY(`autoprint_device_id`, `store_id`)
);
