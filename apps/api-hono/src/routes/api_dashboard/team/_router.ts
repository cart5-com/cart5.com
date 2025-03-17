import { Hono } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getMyTeams_Handler } from "./my_teams.controller";
import {
    teamInviteInfo_Handler,
    teamInviteToken_SchemaValidator
} from "./team_invite_info.controller";
import {
    teamInviteAccept_SchemaValidator,
    teamInviteAccept_Handler
} from "./team_invite_accept.controller";

export const teamRouter = new Hono<HonoVariables>()
    .get(
        '/my_teams',
        getMyTeams_Handler
    )
    .post(
        '/team_invite_info',
        teamInviteToken_SchemaValidator,
        teamInviteInfo_Handler
    )
    .post(
        '/team_invite_accept',
        teamInviteAccept_SchemaValidator,
        teamInviteAccept_Handler
    )