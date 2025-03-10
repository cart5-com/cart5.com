import { Hono } from "hono";
import type { HonoVariables } from '../../../hono/HonoVariables';
import { addDomain, addDomainSchemaValidator } from './add';
import { removeDomain, removeDomainSchemaValidator } from './remove';
import { setDefaultDomain, setDefaultDomainSchemaValidator } from './set-default';
import { websiteRouteAdminCheck } from "../router";

export const domainRouter = new Hono<HonoVariables>()
    .post('/add',
        websiteRouteAdminCheck,
        addDomainSchemaValidator,
        addDomain
    )
    .post('/remove',
        websiteRouteAdminCheck,
        removeDomainSchemaValidator,
        removeDomain
    )
    .post('/set-default',
        websiteRouteAdminCheck,
        setDefaultDomainSchemaValidator,
        setDefaultDomain
    ); 