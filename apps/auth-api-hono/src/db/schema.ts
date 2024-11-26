import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	passwordHash: text("password_hash"), // null if the user was created via Google OAuth
	googleId: text("google_id").unique(),
	name: text("name").notNull(),
	// TODO: isEmailVerified: boolean
	picture: text("picture") // picture url
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	expiresAt: integer("expires_at").notNull(), // milliseconds are included, full timestamp using Date object
	hostname: text("hostname").notNull(),
});
