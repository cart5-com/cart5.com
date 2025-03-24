CREATE TABLE `geocoding_cache` (
	`url` text PRIMARY KEY NOT NULL,
	`response` text,
	`created_at_ts` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `geocoding_cache_url_unique` ON `geocoding_cache` (`url`);