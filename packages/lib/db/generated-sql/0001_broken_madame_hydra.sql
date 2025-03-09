CREATE TABLE `website_domain_map` (
	`hostname` text NOT NULL,
	`website_id` text NOT NULL,
	PRIMARY KEY(`hostname`, `website_id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `website_domain_map_hostname_unique` ON `website_domain_map` (`hostname`);--> statement-breakpoint
CREATE TABLE `website_user_admins_map` (
	`website_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`website_id`, `user_id`)
);
--> statement-breakpoint
CREATE TABLE `websites` (
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner_user_id` text NOT NULL,
	`default_hostname` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `websites_id_unique` ON `websites` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `websites_default_hostname_unique` ON `websites` (`default_hostname`);