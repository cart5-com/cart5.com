import { integer } from "drizzle-orm/sqlite-core";

export const autoCreated = {
    created_at_ts: integer("created_at_ts")
        .notNull()
        .$defaultFn(() => Date.now()),
}

export const autoUpdated = {
    updated_at_ts: integer("updated_at_ts")
        .notNull()
        .$defaultFn(() => Date.now())
        .$onUpdate(() => Date.now())
}

export const autoCreatedUpdated = {
    ...autoCreated,
    ...autoUpdated,
}