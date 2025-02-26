import {
    createEcomApiMapsClient,
    createEcomDashboardApiClient
} from "lib/hono/apiClients/ecomApiClient";

export const dashboardApiClient = createEcomDashboardApiClient();
export const mapsApiClient = createEcomApiMapsClient();