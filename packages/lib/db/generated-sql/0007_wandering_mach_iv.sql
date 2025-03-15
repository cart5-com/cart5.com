CREATE TABLE `team_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`team_name` text NOT NULL,
	`inviter_id` text NOT NULL,
	`email` text NOT NULL,
	`permissions` text,
	`status` text NOT NULL,
	`accepted_at_ts` integer,
	`created_at_ts` integer NOT NULL,
	`updated_at_ts` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_invitations_id_unique` ON `team_invitations` (`id`);