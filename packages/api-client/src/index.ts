import type { ApiAppType } from '../../../apps/api-hono/src/index'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { hc } from 'hono/client'

export type ReqType<T> = InferRequestType<T>;
export type ResType<T> = InferResponseType<T>;

// TODO: Split your app and client into multiple files
// https://hono.dev/docs/guides/rpc#split-your-app-and-client-into-multiple-files

const client = hc<ApiAppType>('')
export type Client = typeof client
// export const hcWithType = (...args: Parameters<typeof hc>): Client => hc<ApiAppType>(...args)
export const createApiClient = (...args: Parameters<typeof hc>): Client => {
    return hc<ApiAppType>(...args)
}


export type User = ResType<Awaited<ReturnType<typeof createApiClient>['auth_global']['whoami']['$post']>>['data'];
export const apiClient = createApiClient('/__p_api/')

// const apiPath = apiClient.dashboard.website[':websiteId'].team.$get
// export type sampleResponseType_TeamMember = ResType<typeof apiPath>["data"]["teamMembers"][0];
// apiClient.dashboard.store[':storeId'].menu.get.$post