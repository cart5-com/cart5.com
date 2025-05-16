
import type { User } from '@lib/types/UserType';
import type { Session } from '@lib/types/SessionType';
import { type HttpBindings } from '@hono/node-server'


type Bindings = HttpBindings & {
    /* ... */
}

export type HonoVariables = {
    Variables: {
        SESSION: Session | null,
        USER: User | null,
    },
    Bindings: Bindings
}
