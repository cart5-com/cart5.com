import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateKey } from "../../utils/generateKey";
import { relations } from "drizzle-orm";
import { userTable } from "./auth.schema";
import { websitesTable } from "./website.schema";

export const teamTable = sqliteTable("team", {
    id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('team')),
    type: text('type', { enum: ['RESTAURANT', 'WEBSITE'] }).notNull(),
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

    TEAM_MANAGER: "TEAM_MANAGER",

    RESTAURANT_MANAGER: "RESTAURANT_MANAGER",
}

export const teamRelations = relations(teamTable, ({ one, many }) => ({
    ownerUser: one(userTable, {
        fields: [teamTable.ownerUserId],
        references: [userTable.id]
    }),
    members: many(teamUserMapTable),
    supportWebsites: many(websitesTable, {
        relationName: "supportTeam"
    }),
    ownerWebsites: many(websitesTable, {
        relationName: "ownerTeam"
    }),
}));

export const teamUserMapRelations = relations(teamUserMapTable, ({ one }) => ({
    team: one(teamTable, {
        fields: [teamUserMapTable.teamId],
        references: [teamTable.id]
    }),
    user: one(userTable, {
        fields: [teamUserMapTable.userId],
        references: [userTable.id]
    }),
}));
