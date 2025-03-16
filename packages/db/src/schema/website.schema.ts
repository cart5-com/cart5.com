import { sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";
import { generateKey } from "@lib/utils/generateKey";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { autoCreatedUpdated } from "./helpers/auto-created-updated";
import { relations } from 'drizzle-orm';
import { z } from "zod";
import { teamTable } from "./team.schema";


export const websitesTable = sqliteTable("websites", {
    ...autoCreatedUpdated,

    id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('web')),
    name: text("name").notNull(),


    defaultHostname: text("default_hostname").unique(),

    ownerTeamId: text("owner_team_id").notNull(),
    supportTeamId: text("support_team_id"),

});
export const insertWebsitesSchema = createInsertSchema(websitesTable, {
    name: z.string().min(1, { message: "min 1" }).max(510, { message: "max 510" }),
});
export const selectWebsitesSchema = createSelectSchema(websitesTable);
export const updateWebsitesSchema = createInsertSchema(websitesTable);








export const websiteDomainMapTable = sqliteTable("website_domain_map", {
    hostname: text("hostname").notNull().unique(),
    websiteId: text("website_id").notNull(),
}, (table) => [
    primaryKey({ columns: [table.hostname, table.websiteId] })
]);
export const selectWebsiteDomainMapSchema = createSelectSchema(websiteDomainMapTable);










export const websiteRelations = relations(websitesTable, ({ one, many }) => ({
    domains: many(websiteDomainMapTable),
    ownerTeam: one(teamTable, {
        fields: [websitesTable.ownerTeamId],
        references: [teamTable.id],
        relationName: "ownerTeam"
    }),
    supportTeam: one(teamTable, {
        fields: [websitesTable.supportTeamId],
        references: [teamTable.id],
        relationName: "supportTeam"
    }),
}));

export const websiteDomainMapRelations = relations(websiteDomainMapTable, ({ one }) => ({
    website: one(websitesTable, {
        fields: [websiteDomainMapTable.websiteId],
        references: [websitesTable.id]
    }),
}));
