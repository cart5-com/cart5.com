import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { autoCreatedUpdated } from "./helpers/auto-created-updated";
import { generateKey } from "@lib/utils/generateKey";
import { z } from "zod";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { createSelectSchema } from "drizzle-zod";

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