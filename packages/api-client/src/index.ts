import type { ApiAppType } from '../../../apps/api-hono/src/index'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { hc } from 'hono/client'

export const createApiClient = (baseUrl: string = '/__p_api/') => {
    const calculatedApiClient = hc<ApiAppType>(baseUrl)
    type typeFromCalculated = typeof calculatedApiClient;
    const hcWithType = (...args: Parameters<typeof hc>): typeFromCalculated =>
        hc<ApiAppType>(...args)
    return hcWithType(baseUrl, {})
}

export const createApiClient_AsUrlHelper = function () {
    return createApiClient(`${window.location.origin}/__p_api/`);
};


export type ReqType<T> = InferRequestType<T>;
export type ResType<T> = InferResponseType<T>;
export type User = ResType<Awaited<ReturnType<typeof createApiClient>['auth_global']['whoami']['$post']>>['data'];

export const apiClient = createApiClient()

// const apiPath = apiClient.dashboard.website[':websiteId'].team.$get
// export type sampleResponseType_TeamMember = ResType<typeof apiPath>["data"]["teamMembers"][0];
// apiClient.dashboard.store[':storeId'].menu.get.$post