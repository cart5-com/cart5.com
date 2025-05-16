import { sqliteTable, text, primaryKey, integer } from "drizzle-orm/sqlite-core";
import { generateKey } from "@lib/utils/generateKey";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { autoCreatedUpdated } from "./helpers/auto-created-updated";
import { relations } from 'drizzle-orm';
import { z } from "zod";
import { teamTable } from "./team.schema";
import { storeTable } from "./store.schema";
import { ServiceFeeSchema, type ServiceFee } from "@lib/zod/serviceFee";

export const websitesTable = sqliteTable("websites", {
    ...autoCreatedUpdated,

    id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('web')),
    name: text("name").notNull(),


    defaultHostname: text("default_hostname").unique(),

    ownerTeamId: text("owner_team_id").notNull(),
    supportTeamId: text("support_team_id"),

    // if false, the website will use websiteStoreMapTable to show only selected stores
    // has no connection with marketplace fees, only for store selection
    // TODO: rename to areAllStoresListedMode
    isMarketplace: integer("is_marketplace", { mode: "boolean" }).notNull().default(true),

    // TODO: add a new column like isMarketingTeamPartner to validate to use it in queries
    // most important is order placing details and frontend/backend calculations
    defaultMarketplaceFee: text("default_marketplace_fee", { mode: 'json' }).$type<ServiceFee>(),

    // TODO: rename to isSupportTeamPartner
    isPartner: integer("is_partner", { mode: "boolean" }).notNull().default(false), // only can be updated by db admin for now
    defaultPartnerFee: text("default_partner_fee", { mode: 'json' }).$type<ServiceFee>(),

});
export const insertWebsitesSchema = createInsertSchema(websitesTable, {
    name: z.string().min(1, { message: "min 1" }).max(510, { message: "max 510" }),
    defaultMarketplaceFee: ServiceFeeSchema.nullable(),
    defaultPartnerFee: ServiceFeeSchema.nullable(),
});
export const selectWebsitesSchema = createSelectSchema(websitesTable);
export const updateWebsitesSchema = createInsertSchema(websitesTable, {
    name: z.string().min(1, { message: "min 1" }).max(510, { message: "max 510" }),
    defaultMarketplaceFee: ServiceFeeSchema.nullable(),
    defaultPartnerFee: ServiceFeeSchema.nullable(),
});



// TODO: ask emails for website related notifications
// TODO: ask emails for marketplace related notifications
// TODO: ask emails for partnership related notifications





/// used by isMarketplace: false websites
/// WEBSITE STORE MAP START
export const websiteStoreMapTable = sqliteTable("website_store_map", {
    websiteId: text("website_id").notNull(),
    storeId: text("store_id").notNull(),
    overrideMarketplaceFee: text("override_marketplace_fee", { mode: 'json' }).$type<ServiceFee>(),
}, (table) => [
    primaryKey({ columns: [table.websiteId, table.storeId] })
]);
/// WEBSITE STORE MAP END






// partner website can override support fees for stores
// we do not use this table like we used to, we use the websiteStoreMapTable instead
// partnerStoreMapTable is only used for overriding service fees for stores
export const partnerStoreMapTable = sqliteTable("partner_store_map", {
    websiteId: text("website_id").notNull(),
    storeId: text("store_id").notNull(),
    overridePartnerFee: text("override_partner_fee", { mode: 'json' }).$type<ServiceFee>(),
}, (table) => [
    primaryKey({ columns: [table.websiteId, table.storeId] })
]);








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
    storeMappings: many(websiteStoreMapTable),
}));


export const websiteDomainMapRelations = relations(websiteDomainMapTable, ({ one }) => ({
    website: one(websitesTable, {
        fields: [websiteDomainMapTable.websiteId],
        references: [websitesTable.id]
    }),
}));

export const websiteStoreMapRelations = relations(websiteStoreMapTable, ({ one }) => ({
    website: one(websitesTable, {
        fields: [websiteStoreMapTable.websiteId],
        references: [websitesTable.id]
    }),
    store: one(storeTable, {
        fields: [websiteStoreMapTable.storeId],
        references: [storeTable.id]
    }),
}));
