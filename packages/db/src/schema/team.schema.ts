import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateKey } from "@lib/utils/generateKey";
import { relations } from "drizzle-orm";
import { userTable } from "./auth.schema";
import { websitesTable } from "./website.schema";
import { autoCreatedUpdated } from "./helpers/auto-created-updated";

/**
 * team are for websites and stores
 * also they can be used for partner teams.
 * if you create a new website or store in a partner website,
 * partner's owner team will become the support team for created website or store.
 */


export const teamTable = sqliteTable("team", {
    id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('team')),
    type: text('type', { enum: ['STORE', 'WEBSITE'] }).notNull(),
    ownerUserId: text("owner_user_id"),
});


export const teamUserMapTable = sqliteTable("team_user_map", {
    teamId: text("team_id").notNull(),
    userId: text("user_id").notNull(),
    permissions: text("permissions", { mode: 'json' }).$type<string[]>().$defaultFn(() => []),
}, (table) => [
    primaryKey({ columns: [table.teamId, table.userId] }),
]);










export const teamInvitationsTable = sqliteTable("team_invitations", {
    id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('t_inv')),
    teamId: text("team_id").notNull(),
    teamName: text("team_name").notNull(),
    inviterId: text("inviter_id").notNull(),
    email: text("email").notNull(),
    permissions: text("permissions", { mode: 'json' }).$type<string[]>().$defaultFn(() => []),
    status: text("status", { enum: ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"] }).notNull(),
    acceptedAt: integer("accepted_at_ts"),
    ...autoCreatedUpdated,
});

export const teamInvitationsRelations = relations(teamInvitationsTable, ({ one }) => ({
    team: one(teamTable, {
        fields: [teamInvitationsTable.teamId],
        references: [teamTable.id]
    }),
    inviter: one(userTable, {
        fields: [teamInvitationsTable.inviterId],
        references: [userTable.id]
    }),
}));



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
