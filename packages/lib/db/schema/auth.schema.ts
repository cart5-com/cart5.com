import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { autoCreated } from "./helpers/auto-created-updated";

export const userTable = sqliteTable("user", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	isEmailVerified: integer("is_email_verified", { mode: "boolean" }).notNull().default(false),

	name: text("name"),
	passwordHash: text("password_hash"),
	pictureUrl: text("picture_url"),


	encryptedTwoFactorAuthKey: blob("encrypted_two_factor_auth_key").$type<Uint8Array | null>(),

	// use decryptToString to show the code
	encryptedTwoFactorAuthRecoveryCode: blob("encrypted_two_factor_auth_recovery_code").$type<Uint8Array | null>(),
});

export const sessionTable = sqliteTable("session", {
	...autoCreated,
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: integer("expires_at").notNull(), // milliseconds are included, full timestamp using Date object
	hostname: text("hostname").notNull(),

	// createdAt to detect is new or old. 
	// it will be used for security validation
	// for ex:password reset, authentication reset, etc.
});
