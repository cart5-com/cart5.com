import { sqliteTable, text, primaryKey, integer } from "drizzle-orm/sqlite-core";
import { generateKey } from "@lib/utils/generateKey";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { autoCreatedUpdated } from "./helpers/auto-created-updated";
import { relations } from 'drizzle-orm';
import { z } from "zod";
import { teamTable } from "./team.schema";
import { restaurantTable } from "./restaurant.schema";


export const websitesTable = sqliteTable("websites", {
    ...autoCreatedUpdated,

    id: text("id").notNull().primaryKey().unique().$defaultFn(() => generateKey('web')),
    name: text("name").notNull(),


    defaultHostname: text("default_hostname").unique(),

    ownerTeamId: text("owner_team_id").notNull(),
    supportTeamId: text("support_team_id"),

    // if false, the website will use websiteRestaurantMapTable  to show selected restaurants
    isMarketplace: integer("is_marketplace", { mode: "boolean" }).notNull().default(true),

});
export const insertWebsitesSchema = createInsertSchema(websitesTable, {
    name: z.string().min(1, { message: "min 1" }).max(510, { message: "max 510" }),
});
export const selectWebsitesSchema = createSelectSchema(websitesTable);
export const updateWebsitesSchema = createInsertSchema(websitesTable);






/// used by isMarketplace: false websites
/// WEBSITE RESTAURANT MAP START
export const websiteRestaurantMapTable = sqliteTable("website_restaurant_map", {
    websiteId: text("website_id").notNull(),
    restaurantId: text("restaurant_id").notNull(),
}, (table) => [
    primaryKey({ columns: [table.websiteId, table.restaurantId] })
]);
/// WEBSITE RESTAURANT MAP END





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
    restaurantMappings: many(websiteRestaurantMapTable),
}));


export const websiteDomainMapRelations = relations(websiteDomainMapTable, ({ one }) => ({
    website: one(websitesTable, {
        fields: [websiteDomainMapTable.websiteId],
        references: [websitesTable.id]
    }),
}));

export const websiteRestaurantMapRelations = relations(websiteRestaurantMapTable, ({ one }) => ({
    website: one(websitesTable, {
        fields: [websiteRestaurantMapTable.websiteId],
        references: [websitesTable.id]
    }),
    restaurant: one(restaurantTable, {
        fields: [websiteRestaurantMapTable.restaurantId],
        references: [restaurantTable.id]
    }),
}));
