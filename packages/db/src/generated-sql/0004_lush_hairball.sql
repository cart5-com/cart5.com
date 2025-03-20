DROP TABLE `restaurant_scheduled_orders_settings`;--> statement-breakpoint
DROP TABLE `restaurant_table_reservation_settings`;--> statement-breakpoint
ALTER TABLE `restaurant_open_hours` DROP COLUMN `on_premise_hours`;--> statement-breakpoint
ALTER TABLE `restaurant_open_hours` DROP COLUMN `table_reservation_hours`;--> statement-breakpoint
ALTER TABLE `restaurant_payment_methods` DROP COLUMN `on_premise_payment_methods`;--> statement-breakpoint
ALTER TABLE `restaurant_payment_methods` DROP COLUMN `table_reservation_payment_methods`;--> statement-breakpoint
ALTER TABLE `restaurant` DROP COLUMN `offers_on_premise`;--> statement-breakpoint
ALTER TABLE `restaurant` DROP COLUMN `offers_table_reservation`;