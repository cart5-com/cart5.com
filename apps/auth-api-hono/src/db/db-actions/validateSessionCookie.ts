import { SESSION_ACTIVE_PERIOD_EXPIRATION_IN, SESSION_EXPIRES_IN } from "lib/auth-consts";
import { deleteSession } from "./deleteSession";
import { getSessionAndUser } from "./getSessionAndUser";
import updateSessionExpiration from "./updateSessionExpiration";
import type { Session } from "../../types/SessionType";
import type { User } from "../../types/UserType";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { Context } from "hono";
import type { honoTypes } from "../../index";

export const validateSessionCookie = async (
    c: Context<honoTypes>,
    sessionCookieValue: string,
    hostname: string,
    ignoreUpdateSessionExpiration: boolean = false // default:do not ignore
): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionCookieValue)));
    const [databaseSession, databaseUser] = await getSessionAndUser(c, sessionId);
    if (!databaseSession) {
        return { session: null, user: null };
    }
    const ENFORCE_HOSTNAME_CHECKS = c.get('ENFORCE_HOSTNAME_CHECKS');
    if (ENFORCE_HOSTNAME_CHECKS && databaseSession.hostname !== hostname) {
        await deleteSession(c, databaseSession.id);
        return { session: null, user: null };
    }
    if (!databaseUser) {
        await deleteSession(c, databaseSession.id);
        return { session: null, user: null };
    }
    if (!isWithinExpirationDate(databaseSession.expiresAt)) {
        await deleteSession(c, databaseSession.id);
        return { session: null, user: null };
    }
    const session: Session = {
        hostname: databaseSession.hostname,
        id: databaseSession.id,
        userId: databaseSession.userId,
        fresh: false,
        expiresAt: databaseSession.expiresAt,
        createdAtTs: databaseSession.createdAtTs
    };
    if (ignoreUpdateSessionExpiration === false) {
        const activePeriodExpirationDate = new Date(
            databaseSession.expiresAt.getTime() - SESSION_ACTIVE_PERIOD_EXPIRATION_IN
        );
        if (!isWithinExpirationDate(activePeriodExpirationDate)) {
            session.fresh = true;
            session.expiresAt = new Date(Date.now() + SESSION_EXPIRES_IN);
            await updateSessionExpiration(c, databaseSession.id, session.expiresAt);
        }
    }
    return { user: databaseUser, session };
}

function isWithinExpirationDate(date: Date): boolean {
    return Date.now() < date.getTime();
}