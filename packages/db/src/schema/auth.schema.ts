import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { relations } from 'drizzle-orm';
import { autoCreated } from "./helpers/auto-created-updated";
import { userDataTable } from "./userData.schema";

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

export const verifiedPhoneNumberTable = sqliteTable("verified_phone_number", {
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	phoneNumber: text("phone_number").notNull(),
});

export const userRelations = relations(userTable, ({ many, one }) => ({
	session: many(sessionTable, {
		relationName: "user"
	}),
	userData: one(userDataTable, {
		fields: [userTable.id],
		references: [userDataTable.userId],
	}),
	verifiedPhoneNumber: many(verifiedPhoneNumberTable, {
		relationName: "user"
	}),
}));

export const verifiedPhoneNumberRelations = relations(verifiedPhoneNumberTable, ({ one }) => ({
	user: one(userTable, {
		fields: [verifiedPhoneNumberTable.userId],
		references: [userTable.id],
		relationName: "user"
	}),
}));


export const sessionRelations = relations(sessionTable, ({ one }) => ({
	user: one(userTable, {
		fields: [sessionTable.userId],
		references: [userTable.id],
		relationName: "user"
	}),
}));
