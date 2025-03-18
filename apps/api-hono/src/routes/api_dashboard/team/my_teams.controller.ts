import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { type ErrorType } from "@lib/types/errors";
import { z } from "zod";
import { getSupportTeamByHostname_Service } from "@db/services/team.service";

export const getMyTeams_SchemaValidator = zValidator('json', z.object({
    userId: z.string(),
    hostname: z.string(),
}))

// TODO: rename to get my support team by hostname
export const getMyTeams_Handler = async (c: Context<
    HonoVariables
>) => {
    return c.json({
        // data: {
        //     myTeams: await getUserTeams_Service(c.get('USER')?.id!),
        //     hostnameSupportTeam:
        // },
        data: await getSupportTeamByHostname_Service(c.req.header()['host']),
        error: null as ErrorType
    }, 200);
}