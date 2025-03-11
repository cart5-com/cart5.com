import { Hono } from "hono"
import type { HonoVariables } from "../../../hono/HonoVariables"
import { createWebsite_Handler, createWebsite_SchemaValidator } from './create/website.create.handler'
import { updateWebsite_Handler, updateWebsite_SchemaValidator } from './update/website.update.handler'
import { getWebsite_Handler, getWebsite_SchemaValidator } from './get/website.get.handler'
import { getMyWebsites_Handler } from "./my_websites/website.my_websites.handler"
import { domainRouter } from "./domains/website.domains.router"
import { websiteAdminCheck } from "./website.admin.check"

export const websiteRouter = new Hono<HonoVariables>()
    .get(
        '/my_websites',
        getMyWebsites_Handler
    )
    .post('/create',
        createWebsite_SchemaValidator,
        createWebsite_Handler
    )
    .patch('/:websiteId',
        websiteAdminCheck,
        updateWebsite_SchemaValidator,
        updateWebsite_Handler
    )
    .post(
        '/:websiteId',
        websiteAdminCheck,
        getWebsite_SchemaValidator,
        getWebsite_Handler
    )
    .route('/:websiteId/domain', domainRouter);

