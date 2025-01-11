import type { User } from './types/UserType';
import type { Session } from './types/SessionType';
import type { drizzle } from 'drizzle-orm/libsql';
import type { HttpBindings } from '@hono/node-server';
import type { schema } from './db/drizzle';

declare global {
    type HonoVariables = {
        SESSION: Session | null,
        USER: User | null,
        IS_PROD: boolean,
        ENFORCE_HOSTNAME_CHECKS: boolean,
        DRIZZLE_DB: ReturnType<typeof drizzle<typeof schema>>
    }

    type HonoBindings = HttpBindings & {
        NODE_ENV: string;
        npm_lifecycle_event: string;
        PUBLIC_DOMAIN_NAME: string;
        KNOWN_DOMAINS_REGEX: string;
        ENCRYPTION_KEY: string;
        JWT_PRIVATE_KEY: string;
        INTERNAL_AUTH_API_KEY: string;
        TURNSTILE_SECRET: string;
        GOOGLE_OAUTH_CLIENT_ID?: string;
        GOOGLE_OAUTH_CLIENT_SECRET?: string;
        GOOGLE_OAUTH_REDIRECT_URI?: string;
        AUTHAPI_TURSO_DB_URL?: string;
        AUTHAPI_TURSO_DB_TOKEN?: string;
        AUTHAPI_TURSO_EMBEDDED_DB_PATH?: string;
    }

    type AuthApiHonoEnv = {
        Bindings: HonoBindings;
        Variables: HonoVariables;
    }
}

export { };

