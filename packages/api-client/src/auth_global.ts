import type { ApiAuthGlobalType } from '../../../apps/api-hono/src/routes/api_auth_global/_router'
import { hc } from 'hono/client'

const client = hc<ApiAuthGlobalType>('')
export type Client = typeof client
export const createAuthGlobalApiClient = (...args: Parameters<typeof hc>): Client => {
    return hc<ApiAuthGlobalType>(...args)
}

export const authGlobalApiClient = createAuthGlobalApiClient('/__p_api/')
