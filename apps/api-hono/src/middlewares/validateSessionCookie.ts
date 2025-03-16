import { ENFORCE_HOSTNAME_CHECKS } from '@lib/utils/enforceHostnameChecks';
import { SESSION_ACTIVE_PERIOD_EXPIRATION_IN, SESSION_EXPIRES_IN } from "@lib/consts";
import type { Session } from "@lib/types/SessionType";
import type { User } from "@lib/types/UserType";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import {
    deleteSessionService,
    updateSessionExpirationService,
    getSessionAndUserService
} from "@db/services/session.service";

export const validateSessionCookie = async (
    sessionCookieValue: string,
    hostname: string
): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionCookieValue)));
    const [databaseSession, databaseUser] = await getSessionAndUserService(sessionId);
    if (!databaseSession) {
        return { session: null, user: null };
    }
    // it should not delete for localhost with different ports
    if (ENFORCE_HOSTNAME_CHECKS && databaseSession.hostname !== hostname) {
        await deleteSessionService(databaseSession.id);
        return { session: null, user: null };
    }
    if (!databaseUser) {
        await deleteSessionService(databaseSession.id);
        return { session: null, user: null };
    }
    if (!isWithinExpirationDate(databaseSession.expiresAt)) {
        await deleteSessionService(databaseSession.id);
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
    const activePeriodExpirationDate = new Date(
        databaseSession.expiresAt.getTime() - SESSION_ACTIVE_PERIOD_EXPIRATION_IN
    );
    if (!isWithinExpirationDate(activePeriodExpirationDate)) {
        session.fresh = true;
        session.expiresAt = new Date(Date.now() + SESSION_EXPIRES_IN);
        await updateSessionExpirationService(databaseSession.id, session.expiresAt);
    }
    return { user: databaseUser, session };
}

function isWithinExpirationDate(date: Date): boolean {
    return Date.now() < date.getTime();
}