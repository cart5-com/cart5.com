import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateKey } from "../../utils/generateKey";

export const teamTable = sqliteTable("team", {
    id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('team')),
    name: text("name").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
});


export const teamUserMapTable = sqliteTable("team_user_map", {
    teamId: text("team_id").notNull(),
    userId: text("user_id").notNull(),
    permissions: text("permissions", { mode: "json" }).$type<string[]>().$defaultFn(() => []),
}, (table) => [
    primaryKey({ columns: [table.teamId, table.userId] }),
]);

export const TEAM_PERMISSIONS = {
    FULL_ACCESS: "FULL_ACCESS",

    WEBSITE_MANAGER: "WEBSITE_MANAGER",

    RESTAURANT_MANAGER: "RESTAURANT_MANAGER",
}
