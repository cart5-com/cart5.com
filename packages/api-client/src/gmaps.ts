import type { ApiGmapsType } from '../../../apps/api-hono/src/routes/gmaps/mapsRoute.controller'
import { hc } from 'hono/client'

const client = hc<ApiGmapsType>('')
type Client = typeof client
const createGmapsApiClient = (...args: Parameters<typeof hc>): Client => {
    return hc<ApiGmapsType>(...args)
}

export const gmapsApiClient = createGmapsApiClient('/__p_api/gmaps/')
