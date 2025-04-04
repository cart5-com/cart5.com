import type { ApiAuthGlobalRouteType } from '../../../apps/api-hono/src/routes/api_auth_global/_router'
import { hc } from 'hono/client'

const client = hc<ApiAuthGlobalRouteType>('')
export type Client = typeof client
export const createApiClient = (...args: Parameters<typeof hc>): Client => {
    return hc<ApiAuthGlobalRouteType>(...args)
}

export const authGlobalApiClient = createApiClient('/__p_api/')
