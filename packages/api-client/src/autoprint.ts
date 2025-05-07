import type { ApiAutoprintType } from '../../../apps/api-hono/src/routes/api_autoprint/_router'
import { hc } from 'hono/client'

const client = hc<ApiAutoprintType>('')
type Client = typeof client

export const createAutoprintApiClient = (...args: Parameters<typeof hc>): Client => {
    return hc<ApiAutoprintType>(...args)
}

export const autoprintApiClient = createAutoprintApiClient('/__p_api/autoprint/')
