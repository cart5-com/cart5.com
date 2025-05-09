import type { ApiAutoprintTasksType } from '../../../apps/api-hono/src/routes/api_autoprint_tasks/_router'
import { hc } from 'hono/client'

const client = hc<ApiAutoprintTasksType>('')
type Client = typeof client

export const createAutoprintTasksApiClient = (...args: Parameters<typeof hc>): Client => {
    return hc<ApiAutoprintTasksType>(...args)
}

export const autoprintTasksApiClient = createAutoprintTasksApiClient('/__p_api/autoprint_tasks/')
