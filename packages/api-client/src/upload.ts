import type { ApiUploadType } from '../../../apps/api-hono/src/routes/upload'
import { hc } from 'hono/client'

const client = hc<ApiUploadType>('')
type Client = typeof client
const createUploadApiClient = (...args: Parameters<typeof hc>): Client => {
    return hc<ApiUploadType>(...args)
}

export const uploadApiClient = createUploadApiClient('/__p_api/upload/')
