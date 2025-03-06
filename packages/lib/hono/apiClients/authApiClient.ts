import type { AuthApiAppType } from '../../../../apps/api-hono/src/index'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { hc } from 'hono/client'

export const createAuthApiClient = (baseUrl: string = '/__p_auth/') => {
    const calculatedApiClient = hc<AuthApiAppType>(baseUrl)
    type typeFromCalculated = typeof calculatedApiClient;
    const hcWithType = (...args: Parameters<typeof hc>): typeFromCalculated =>
        hc<AuthApiAppType>(...args)
    return hcWithType(baseUrl, {})
}

export type ReqType<T> = InferRequestType<T>;
export type ResType<T> = InferResponseType<T>;
export type User = ResType<Awaited<ReturnType<typeof createAuthApiClient>['api']['user']['whoami']['$post']>>['data'];