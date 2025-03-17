import type {
    EcomDashboardApiAppType,
    EcomApiMapsAppType
} from '../../../apps/api-hono/src/index'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { hc } from 'hono/client'

export const createEcomDashboardApiClient = (baseUrl: string = '/__p_api/') => {
    const calculatedApiClient = hc<EcomDashboardApiAppType>(baseUrl)
    type typeFromCalculated = typeof calculatedApiClient;
    const hcWithType = (...args: Parameters<typeof hc>): typeFromCalculated =>
        hc<EcomDashboardApiAppType>(...args)
    return hcWithType(baseUrl, {})
}

export const createEcomApiMapsClient = (baseUrl: string = '/__p_api/') => {
    const calculatedApiClient = hc<EcomApiMapsAppType>(baseUrl)
    type typeFromCalculated = typeof calculatedApiClient;
    const hcWithType = (...args: Parameters<typeof hc>): typeFromCalculated =>
        hc<EcomApiMapsAppType>(...args)
    return hcWithType(baseUrl, {})
}

export type ReqType<T> = InferRequestType<T>;
export type ResType<T> = InferResponseType<T>;
// export type sampleApiReqType = ReqType<Awaited<ReturnType<typeof createEcomDashboardApiClient>['api']['dashboard']['restaurant'][':restaurantId']['$patch']>>['json'];
// export type predictionType = ResType<
//     Awaited<
//         ReturnType<typeof createEcomApiMapsClient>['api']['maps']['gmaps']['autocomplete']['$get']
//     >
// >['data']['predictions'][number];

// export type predictionExtraType = (predictionType & { lat?: number; lng?: number });