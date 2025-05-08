import { sqliteTable, text, primaryKey, integer } from "drizzle-orm/sqlite-core";
import { relations } from 'drizzle-orm';
import { autoCreated, autoCreatedUpdated } from "./helpers/auto-created-updated";
import { generateKey } from "@lib/utils/generateKey";
import { z } from "zod";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { createSelectSchema } from "drizzle-zod";
import { storeTable } from "./store.schema";

export const autoprintDeviceTable = sqliteTable("autoprint_device", {
    ...autoCreatedUpdated,
    autoprintDeviceId: text("autoprint_device_id").notNull().primaryKey().unique().$defaultFn(() => generateKey('apd')),
    name: text("name").notNull(),
    // status: text("status", { enum: ['ONLINE', 'OFFLINE'] }).notNull().default('OFFLINE'),
    // ipAddress: text("ip_address").notNull(),
    secretKey: text("secret_key").notNull(),
    printers: text("printers", { mode: 'json' }).$type<any[]>(),
});

export const selectAutoprintDeviceSchema = createSelectSchema(autoprintDeviceTable);
const overrideAutoprintDeviceTableSchema = {
    // printers: z.array(z.object({
    //     name: z.string()
    // })),
    printers: z.array(z.any()),
}
export const insertAutoprintDeviceSchema = createInsertSchema(autoprintDeviceTable, overrideAutoprintDeviceTableSchema);
export const updateAutoprintDeviceSchema = createUpdateSchema(autoprintDeviceTable, overrideAutoprintDeviceTableSchema);

// store can have multiple autoprint devices, autoprint device can be paired with multiple stores
export const autoprintDeviceStoreMapTable = sqliteTable("autoprint_device_store_map", {
    autoprintDeviceId: text("autoprint_device_id").notNull(),
    storeId: text("store_id").notNull(),
}, (table) => [
    primaryKey({ columns: [table.autoprintDeviceId, table.storeId] })
]);

// TODO: should be expired after 20 minutes and store should be notified
export const autoprintDeviceTaskTable = sqliteTable("autoprint_device_task", {
    ...autoCreated,
    taskId: text("task_id").notNull().primaryKey().unique().$defaultFn(() => generateKey('apt')),
    autoprintDeviceId: text("autoprint_device_id").notNull(),
    printerName: text("printer_name").notNull(),
    copies: integer("copies").notNull().default(1),
    storeId: text("store_id").notNull(),
    orderId: text("order_id").notNull(),
    html: text("html"),
});

export const autoprintDeviceRelations = relations(autoprintDeviceTable, ({ many }) => ({
    storeMap: many(autoprintDeviceStoreMapTable),
    task: many(autoprintDeviceTaskTable),
}));

export const autoprintDeviceStoreMapRelations = relations(autoprintDeviceStoreMapTable, ({ one }) => ({
    device: one(autoprintDeviceTable, {
        fields: [autoprintDeviceStoreMapTable.autoprintDeviceId],
        references: [autoprintDeviceTable.autoprintDeviceId],
    }),
    store: one(storeTable, {
        fields: [autoprintDeviceStoreMapTable.storeId],
        references: [storeTable.id],
    }),
}));
