import { autoprintDeviceTable } from "@db/schema/autoprint.schema";
import db from '@db/drizzle';
import { eq, type InferInsertModel } from 'drizzle-orm';

export const getAutoPrintDevice_Service = async (
    autoprintDeviceId: string,
    columns?: Partial<Record<keyof typeof autoprintDeviceTable.$inferSelect, boolean>>
) => {
    return await db.query.autoprintDeviceTable.findFirst({
        where: eq(autoprintDeviceTable.autoprintDeviceId, autoprintDeviceId),
        columns: columns,
    });
}

export const updateAutoPrintDevice_Service = async (
    autoprintDeviceId: string,
    data: Partial<InferInsertModel<typeof autoprintDeviceTable>>
) => {
    return await db.insert(autoprintDeviceTable)
        .values({ ...data, autoprintDeviceId } as InferInsertModel<typeof autoprintDeviceTable>)
        .onConflictDoUpdate({
            target: autoprintDeviceTable.autoprintDeviceId,
            set: data
        });
}