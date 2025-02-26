import type { User } from '../auth/types/UserType';
import type { Session } from '../auth/types/SessionType';

export type HonoVariables = {
    Variables: {
        SESSION: Session | null,
        USER: User | null,
    }
}
