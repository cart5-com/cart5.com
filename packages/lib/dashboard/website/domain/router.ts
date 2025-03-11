import { Hono } from "hono";
import type { HonoVariables } from '../../../hono/HonoVariables';
import { addDomain, addDomainSchemaValidator } from './add';
import { removeDomain, removeDomainSchemaValidator } from './remove';
import { setDefaultDomain, setDefaultDomainSchemaValidator } from './set-default';
import { websiteRouteAdminCheck } from "../router";

export const domainRouter = new Hono<HonoVariables>()
    .use(websiteRouteAdminCheck)
    .post('/add',
        addDomainSchemaValidator,
        addDomain
    )
    .post('/remove',
        removeDomainSchemaValidator,
        removeDomain
    )
    .post('/set-default',
        setDefaultDomainSchemaValidator,
        setDefaultDomain
    ); 