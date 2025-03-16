
import type { User } from '@lib/types/UserType';
import type { Session } from '@lib/types/SessionType';

export type HonoVariables = {
    Variables: {
        SESSION: Session | null,
        USER: User | null,
    }
}
