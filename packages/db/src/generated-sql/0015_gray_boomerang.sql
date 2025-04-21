PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_verified_phone_number` (
	`user_id` text NOT NULL,
	`phone_number` text NOT NULL,
	PRIMARY KEY(`user_id`, `phone_number`)
);
--> statement-breakpoint
INSERT INTO `__new_verified_phone_number`("user_id", "phone_number") SELECT "user_id", "phone_number" FROM `verified_phone_number`;--> statement-breakpoint
DROP TABLE `verified_phone_number`;--> statement-breakpoint
ALTER TABLE `__new_verified_phone_number` RENAME TO `verified_phone_number`;--> statement-breakpoint
PRAGMA foreign_keys=ON;