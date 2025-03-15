import { Hono } from "hono"
import type { HonoVariables } from "../../../hono/HonoVariables"
import { createWebsite_Handler, createWebsite_SchemaValidator } from './create/website.create.handler'
import { updateWebsite_Handler, updateWebsite_SchemaValidator } from './update/website.update.handler'
import { getWebsite_Handler, getWebsite_SchemaValidator } from './get/website.get.handler'
import { getMyWebsites_Handler } from "./my_websites/website.my_websites.handler"
import { domainRouter } from "../website_domains/website.domains.router"
import { websiteAdminCheck } from "./website.admin.check"
import { getWebsiteTeamMembers_Handler } from "./team/website.team.handler"
import { inviteTeamMember_Handler, inviteTeamMember_SchemaValidator } from "./team_invite/website.team_invite.handler"

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
    .get(
        '/:websiteId/team',
        websiteAdminCheck,
        getWebsiteTeamMembers_Handler
    )
    .post(
        '/:websiteId/team_invite',
        websiteAdminCheck,
        inviteTeamMember_SchemaValidator,
        inviteTeamMember_Handler
    )
    .route('/:websiteId/domain', domainRouter);

