import { sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";
import { generateKey } from "../../utils/generateKey";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { autoCreatedUpdated } from "./helpers/auto-created-updated";
import { relations } from 'drizzle-orm';

export const websitesTable = sqliteTable("websites", {
    ...autoCreatedUpdated,

    id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('web')),
    name: text("name").notNull(),

    ownerUserId: text("owner_user_id").notNull(),

    defaultHostname: text("default_hostname").notNull().unique(),


});
export const insertWebsitesSchema = createInsertSchema(websitesTable);
export const selectWebsitesSchema = createSelectSchema(websitesTable);
export const updateWebsitesSchema = createInsertSchema(websitesTable);

export const websiteDomainMapTable = sqliteTable("website_domain_map", {
    hostname: text("hostname").notNull().unique(),
    websiteId: text("website_id").notNull(),
}, (table) => [
    primaryKey({ columns: [table.hostname, table.websiteId] })
]);
export const selectWebsiteDomainMapSchema = createSelectSchema(websiteDomainMapTable);


/// WEBSITE USER ADMINS MAP START
export const websiteUserAdminsMapTable = sqliteTable("website_user_admins_map", {
    websiteId: text("website_id").notNull(),
    userId: text("user_id").notNull(),
}, (table) => [
    primaryKey({ columns: [table.websiteId, table.userId] }),
]);
/// WEBSITE USER ADMINS MAP END

export const websiteRelations = relations(websitesTable, ({ many }) => ({
    domains: many(websiteDomainMapTable),
    userAdmins: many(websiteUserAdminsMapTable),
}));

export const websiteDomainMapRelations = relations(websiteDomainMapTable, ({ one }) => ({
    website: one(websitesTable, {
        fields: [websiteDomainMapTable.websiteId],
        references: [websitesTable.id]
    }),
}));

export const websiteUserAdminsMapRelations = relations(websiteUserAdminsMapTable, ({ one }) => ({
    website: one(websitesTable, {
        fields: [websiteUserAdminsMapTable.websiteId],
        references: [websitesTable.id]
    }),
}));