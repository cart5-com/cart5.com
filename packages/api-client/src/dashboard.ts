import type { ApiDashboardType } from '../../../apps/api-hono/src/routes/api_dashboard/_router'
import { hc } from 'hono/client'

const client = hc<ApiDashboardType>('')
type Client = typeof client
const createDashboardApiClient = (...args: Parameters<typeof hc>): Client => {
    return hc<ApiDashboardType>(...args)
}

export const dashboardApiClient = createDashboardApiClient('/__p_api/dashboard/')
