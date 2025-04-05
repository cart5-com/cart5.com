import type { ApiDashboardRouteType } from '../../../apps/api-hono/src/routes/api_dashboard/_router'
import { hc } from 'hono/client'

const client = hc<ApiDashboardRouteType>('')
export type Client = typeof client
export const createDashboardApiClient = (...args: Parameters<typeof hc>): Client => {
    return hc<ApiDashboardRouteType>(...args)
}

export const dashboardApiClient = createDashboardApiClient('/__p_api/')
