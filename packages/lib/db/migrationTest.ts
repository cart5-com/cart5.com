import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { resolve, dirname } from "node:path";

/*
    This script is used to test the database migration process.
    It creates a new database from the production database, migrates the new database, and then deletes the new database.
    It is used to test the database migration process.

    if you would like test a failed migration, add a new required field without a default value in your drizzle schema
    requiredField: text("required_field").notNull(),

    then run  `pnpm generate:sql`
    then run `pnpm test:prod:migrate`
    it will fail and you will see the error in the console, 
    thanks to 'preprod:migrate' script, it will not continue to `prod:migrate`
*/
const start = async () => {
    const newDatabaseName = "test-db-migration-with-branching-" + Date.now();
    let isDbDeleted = true;
    try {
        console.log("🥹 Creating a new database from production database:", newDatabaseName);
        const database = await createDatabase(newDatabaseName);
        if (!database?.database?.Hostname) {
            throw new Error("Failed to create database");
        }
        isDbDeleted = false;
        console.log("- Creating a token for the new database:", newDatabaseName);
        const token = await createToken(newDatabaseName);
        if (!token?.jwt) {
            throw new Error("Failed to create token");
        }

        const __dirname = dirname(new URL(import.meta.url).pathname);
        const path = "./generated-sql";
        const migrationsFolder = resolve(__dirname, path);
        console.log("- Migrations path:", migrationsFolder);
        console.log("- Migrating the new database:", newDatabaseName);
        const db = drizzle({
            connection: {
                url: `libsql://${database.database.Hostname}`,
                authToken: token.jwt
            }
        });

        await migrate(db, { migrationsFolder });
        console.log("✅ Migration completed for the new database🍻:", newDatabaseName);
        const deleteResult = await deleteDatabase(newDatabaseName);
        if (!deleteResult) {
            throw new Error("Failed to delete database");
        }
        isDbDeleted = true;
        console.log("✅ Deleted the new database:", newDatabaseName);
        process.exit(0);
    } catch (error) {
        console.error("💩💩💩💩💩💩💩💩💩💩💩");
        console.error("🟥🟥🟥 Error ❌❌❌");
        console.error("💩💩💩💩💩💩💩💩💩💩💩");
        console.error(error);
        if (isDbDeleted === false) {
            await deleteDatabase(newDatabaseName);
            console.log("❌Deleted the new database:", newDatabaseName);
        }
        process.exit(1);
    }
}

const deleteDatabase = async (databaseName: string) => {
    const url = `https://api.turso.tech/v1/organizations/${process.env.TURSO_ORGANIZATION_NAME}/databases/${databaseName}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${process.env.TURSO_API_TOKEN}`
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to delete database: ${response.statusText}`);
    }
    const json = await response.json();
    return json;
}

const listOrganizations = async () => {
    const url = `https://api.turso.tech/v1/organizations`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.TURSO_API_TOKEN}`
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to list organizations: ${response.statusText}`);
    }
    const json = await response.json();
    return json;
}

const listDatabases = async () => {
    const url = `https://api.turso.tech/v1/organizations/${process.env.TURSO_ORGANIZATION_NAME}/databases`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.TURSO_API_TOKEN}`
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to list databases: ${response.statusText}`);
    }
    const json = await response.json();
    return json;
}

const createDatabase = async (TURSO_MIGRATION_TEST_DATABASE_NAME: string) => {
    if (!process.env.TURSO_ORGANIZATION_NAME || !process.env.TURSO_API_TOKEN || !process.env.TURSO_GROUP_NAME || !process.env.TURSO_PROD_DATABASE_NAME) {
        throw new Error("Missing required environment variables");
    }
    const url = `https://api.turso.tech/v1/organizations/${process.env.TURSO_ORGANIZATION_NAME}/databases`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.TURSO_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: TURSO_MIGRATION_TEST_DATABASE_NAME,
            group: process.env.TURSO_GROUP_NAME,
            seed: {
                type: "database",
                name: process.env.TURSO_PROD_DATABASE_NAME
            }
        })
    });
    if (!response.ok) {
        throw new Error(`Failed to create database: ${response.statusText}`);
    }
    const json = await response.json();
    return json as {
        database: {
            DbId: string;
            Hostname: string;
            IssuedCertCount: number;
            IssuedCertLimit: number;
            Name: string;
        },
        password: string;
        username: string;
    };
}

const createToken = async (databaseName: string) => {
    const response = await fetch(`https://api.turso.tech/v1/organizations/${process.env.TURSO_ORGANIZATION_NAME}/` +
        `databases/${databaseName}/auth/tokens?expiration=2w&authorization=full-access`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.TURSO_API_TOKEN}`
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to create token: ${response.statusText}`);
    }
    const json = await response.json();
    return json as { jwt: string };
}


start();