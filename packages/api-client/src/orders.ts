import type { ApiOrdersType } from '../../../apps/api-hono/src/routes/api_orders/_router'
import { hc } from 'hono/client'

const client = hc<ApiOrdersType>('')
type Client = typeof client

export const createOrdersApiClient = (...args: Parameters<typeof hc>): Client => {
    return hc<ApiOrdersType>(...args)
}

export const ordersApiClient = createOrdersApiClient('/__p_api/orders/')
