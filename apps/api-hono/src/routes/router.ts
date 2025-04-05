import { Hono } from 'hono'
import type { HonoVariables } from "@api-hono/types/HonoVariables";
// import { apiAuth } from './api_auth/_router';
import { apiDashboard } from './api_dashboard/_router';
import { authGlobalRoute } from './api_auth_global/_router';
import { mapsRoute } from './gmaps/mapsRoute.controller';
import { validateDomainForTLS } from './validate_domain';

export const apiRouter = new Hono<HonoVariables>()
    .get(
        '/validate_tls',
        validateDomainForTLS
    )
    // .route('/', apiAuth)
    .route('/', authGlobalRoute)
    .route('/dashboard', apiDashboard)
    .route('/gmaps', mapsRoute)
