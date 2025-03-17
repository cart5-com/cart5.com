import { getWebsite_Handler } from "./get.controller";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getWebsite_SchemaValidator } from "./get.controller";
import { Hono } from "hono";
import { TEAM_PERMISSIONS } from "@lib/consts";
import { checkWebsitePermissions } from "@api-hono/utils/checkWebsitePermissions";
import { getWebsiteTeamMembers_Handler } from "./team.controller";

export const websiteRouter = new Hono<HonoVariables>()
    .post(
        '/:websiteId',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ]),
        getWebsite_SchemaValidator,
        getWebsite_Handler
    )
    .get(
        '/:websiteId/team',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        getWebsiteTeamMembers_Handler
    )
// .get(
//     '/my_websites',
//     getMyWebsites_Handler
// )
// .post('/create',
//     createWebsite_SchemaValidator,
//     createWebsite_Handler
// )
// .patch('/:websiteId',
//     websiteAdminCheck,
//     updateWebsite_SchemaValidator,
//     updateWebsite_Handler
// )
// .get(
//     '/:websiteId/team',
//     websiteAdminCheck,
//     getWebsiteTeamMembers_Handler
// )
// .post(
//     '/:websiteId/team_invite',
//     websiteAdminCheck,
//     inviteTeamMember_SchemaValidator,
//     inviteTeamMember_Handler
// )
// .route('/:websiteId/domain', domainRouter)

