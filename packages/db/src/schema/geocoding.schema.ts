import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { autoCreated } from "./helpers/auto-created-updated";

export const geocodingCacheTable = sqliteTable("geocoding_cache", {
    url: text("url").notNull().unique().primaryKey(),
    response: text("response", { mode: "json" }).$type<google.maps.GeocoderResponse>(),
    ...autoCreated,
});
