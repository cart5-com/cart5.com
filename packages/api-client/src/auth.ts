import type { ApiAuthRouteType } from '../../../apps/api-hono/src/routes/api_auth/_router'
import { hc } from 'hono/client'

const client = hc<ApiAuthRouteType>('')
export type Client = typeof client
export const createAuthApiClient = (...args: Parameters<typeof hc>): Client => {
    return hc<ApiAuthRouteType>(...args)
}

export const authApiClient = createAuthApiClient('/__p_api/auth/')
