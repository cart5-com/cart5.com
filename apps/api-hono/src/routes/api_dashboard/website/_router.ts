import { getWebsite_Handler } from "./get.controller";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getWebsite_SchemaValidator } from "./get.controller";
import { Hono } from "hono";
import { TEAM_PERMISSIONS } from "@lib/consts";
import { checkWebsitePermissions } from "@api-hono/utils/checkWebsitePermissions";
import { getWebsiteTeamMembers_Handler } from "./team/team.controller";
import { inviteTeamMember_SchemaValidator } from "./team/team_invite.controller";
import { inviteTeamMember_Handler } from "./team/team_invite.controller";
import { updateWebsite_Handler, updateWebsite_SchemaValidator } from "./update.controller";
import { getMyWebsites_Handler } from "./my_websites.controller";
import { createWebsite_SchemaValidator, createWebsite_Handler } from "./create.controller";
import { addDomain_Handler } from "./domain/domain_add.controller";
import { hostname_SchemaValidator } from "./domain/domain_set_default.controller";
import { listDomains_Handler, listDomains_SchemaValidator } from "./domain/domain_list.controller";
import { removeDomain_Handler } from "./domain/domain_remove.controller";
import { setDefaultDomain_Handler } from "./domain/domain_set_default.controller";
import { getTeamInvitations_Handler } from "./team/team_invitations.controller";
import { cancelTeamInvitation_Handler, cancelTeamInvitation_SchemaValidator } from "./team/team_invite_cancel.controller";
import { transferTeamOwnership_Handler, transferTeamOwnership_SchemaValidator } from "./team/team_transfer_ownership.controller";
import { removeTeamMember_Handler, removeTeamMember_SchemaValidator } from "./team/team_remove_member.controller";
import { updateTeamMemberPermissions_Handler, updateTeamMemberPermissions_SchemaValidator } from "./team/team_update_permissions.controller";
import { storesRouter } from "./stores/_router";
import { getWebsiteInfo_Handler } from "./info.controller";

export const websiteRouter = new Hono<HonoVariables>()
    .get(
        '/my_websites',
        getMyWebsites_Handler
    )
    .get(
        '/info',
        getWebsiteInfo_Handler
    )
    .post(
        '/create',
        createWebsite_SchemaValidator,
        createWebsite_Handler
    )
    .post(
        '/:websiteId',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ]),
        getWebsite_SchemaValidator,
        getWebsite_Handler
    )
    .patch('/:websiteId',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER,
        ]),
        updateWebsite_SchemaValidator,
        updateWebsite_Handler
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
    .get(
        '/:websiteId/team_invitations',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        getTeamInvitations_Handler
    )
    .post(
        '/:websiteId/team_invite',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        inviteTeamMember_SchemaValidator,
        inviteTeamMember_Handler
    )
    .post(
        '/:websiteId/team_invite_cancel',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        cancelTeamInvitation_SchemaValidator,
        cancelTeamInvitation_Handler
    )
    .post(
        '/:websiteId/team_transfer_ownership',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS
        ]),
        transferTeamOwnership_SchemaValidator,
        transferTeamOwnership_Handler
    )
    .post(
        '/:websiteId/team_remove_member',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        removeTeamMember_SchemaValidator,
        removeTeamMember_Handler
    )
    .post(
        '/:websiteId/team_update_permissions',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        updateTeamMemberPermissions_SchemaValidator,
        updateTeamMemberPermissions_Handler
    )
    // Domain Routes
    .post(
        '/:websiteId/domain/add',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER,
        ]),
        hostname_SchemaValidator,
        addDomain_Handler
    )
    .post(
        '/:websiteId/domain/list',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER,
        ]),
        listDomains_SchemaValidator,
        listDomains_Handler
    )
    .post(
        '/:websiteId/domain/remove',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER,
        ]),
        hostname_SchemaValidator,
        removeDomain_Handler
    )
    .post(
        '/:websiteId/domain/set_default',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER,
        ]),
        hostname_SchemaValidator,
        setDefaultDomain_Handler
    )
    .route('/:websiteId/stores', storesRouter)
