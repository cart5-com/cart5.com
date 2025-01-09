import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateKey } from "lib/utils/generateKey";

export const restaurantTable = sqliteTable("restaurant", {
	id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('resto')),

	name: text("name").notNull().unique(),

	ownerUserId: text("owner_user_id").notNull(),

	created_at_ts: integer("created_at_ts")
		.notNull()
		.$defaultFn(() => Date.now()),
	updated_at_ts: integer("updated_at_ts")
		.notNull()
		.$defaultFn(() => Date.now())
		.$onUpdate(() => Date.now()),
});