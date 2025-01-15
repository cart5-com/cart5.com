import {
    createEcomApiMapsClient,
    createEcomDashboardApiClient
} from "lib/apiClients/ecomApiClient";

export const dashboardApiClient = createEcomDashboardApiClient();
export const mapsApiClient = createEcomApiMapsClient();