import {
    createEcomApiMapsClient,
    createEcomDashboardApiClient
} from "@api-client/ecomApiClient";

export const dashboardApiClient = createEcomDashboardApiClient();
export const mapsApiClient = createEcomApiMapsClient();