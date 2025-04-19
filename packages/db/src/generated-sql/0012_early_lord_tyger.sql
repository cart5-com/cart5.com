CREATE TABLE `verified_phone_number` (
	`user_id` text NOT NULL,
	`phone_number` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
