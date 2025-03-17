import type { AuthApiAppType } from '../../../apps/api-hono/src/index'
import type { AuthGlobalApiAppType } from '../../../apps/api-hono/src/index'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { hc } from 'hono/client'

export const createAuthApiClient = (baseUrl: string = '/__p_api/') => {
    const calculatedApiClient = hc<AuthApiAppType>(baseUrl)
    type typeFromCalculated = typeof calculatedApiClient;
    const hcWithType = (...args: Parameters<typeof hc>): typeFromCalculated =>
        hc<AuthApiAppType>(...args)
    return hcWithType(baseUrl, {})
}

export const createAuthGlobalApiClient = (baseUrl: string = '/__p_api/') => {
    const calculatedApiClient = hc<AuthGlobalApiAppType>(baseUrl)
    type typeFromCalculated = typeof calculatedApiClient;
    const hcWithType = (...args: Parameters<typeof hc>): typeFromCalculated =>
        hc<AuthGlobalApiAppType>(...args)
    return hcWithType(baseUrl, {})
}

export type ReqType<T> = InferRequestType<T>;
export type ResType<T> = InferResponseType<T>;
export type User = ResType<Awaited<ReturnType<typeof createAuthGlobalApiClient>['api_auth_global']['whoami']['$post']>>['data'];