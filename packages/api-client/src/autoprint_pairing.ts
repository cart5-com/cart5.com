import type { ApiAutoprintPairingType } from '../../../apps/api-hono/src/routes/api_autoprint_pairing/_router'
import { hc } from 'hono/client'

const client = hc<ApiAutoprintPairingType>('')
type Client = typeof client

export const createAutoprintPairingApiClient = (...args: Parameters<typeof hc>): Client => {
    return hc<ApiAutoprintPairingType>(...args)
}

export const autoprintPairingApiClient = createAutoprintPairingApiClient('/__p_api/autoprint_pairing/')
