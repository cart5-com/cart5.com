import type { User } from 'lib/apiClients/authApiClient';
import type { drizzle } from 'drizzle-orm/libsql';
import type { HttpBindings } from '@hono/node-server';
import type { schema } from './db/drizzle';

declare global {
    type HonoVariables = {
        USER: User | null,
    }

    type HonoBindings = HttpBindings & {
        NODE_ENV: string;
        PUBLIC_DOMAIN_NAME: string;
        INTERNAL_AUTH_API_ORIGIN: string;
        INTERNAL_AUTH_API_KEY: string;
        TURNSTILE_SECRET: string;
        ECOM_API_TURSO_DB_URL?: string;
        ECOM_API_TURSO_DB_TOKEN?: string;
        ECOM_API_TURSO_EMBEDDED_DB_PATH?: string;
    }

    type EcomApiHonoEnv = {
        Bindings: HonoBindings;
        Variables: HonoVariables;
    }
}

export { };
