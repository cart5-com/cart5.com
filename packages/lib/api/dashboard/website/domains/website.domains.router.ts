import { Hono } from "hono";
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { addDomain_Handler } from './add/website.domains.add.handler';
import { websiteAdminCheck } from "../website.admin.check";
import { removeDomain_Handler } from "./remove/website.domains.remove.handler";
import { setDefaultDomain_Handler } from "./set_default/website.domains.set_default.handler";
import { ENFORCE_HOSTNAME_CHECKS } from "../../../../auth/enforceHostnameChecks";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { listDomains_Handler, listDomains_SchemaValidator } from "./list/website.domains.list.handler";

export const hostname_Schema = z.object({
    hostname: ENFORCE_HOSTNAME_CHECKS
        ? z.string()
            .min(3, { message: "Domain name must be at least 3 characters" })
            .max(255, { message: "Domain name must be less than 255 characters" })
            .regex(/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, {
                message: "Please enter a valid domain name (e.g. example.com)"
            })
        : z.string()
            .min(3, { message: "Domain name must be at least 3 characters" })
            .max(255, { message: "Domain name must be less than 255 characters" })
});
export const hostname_SchemaValidator = zValidator('json', hostname_Schema);

export const domainRouter = new Hono<HonoVariables>()
    .use(websiteAdminCheck)
    .post('/add',
        hostname_SchemaValidator,
        addDomain_Handler
    )
    .post('/remove',
        hostname_SchemaValidator,
        removeDomain_Handler
    )
    .post('/set_default',
        hostname_SchemaValidator,
        setDefaultDomain_Handler
    )
    .post('/list',
        listDomains_SchemaValidator,
        listDomains_Handler
    );