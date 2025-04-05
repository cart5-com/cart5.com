import type { ApiAuthType } from '../../../apps/api-hono/src/routes/api_auth/_router'
import { hc } from 'hono/client'

const client = hc<ApiAuthType>('')
export type Client = typeof client
export const createAuthApiClient = (...args: Parameters<typeof hc>): Client => {
    return hc<ApiAuthType>(...args)
}

export const authApiClient = createAuthApiClient('/__p_api/')
