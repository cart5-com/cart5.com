import { insertWebsitesSchema } from "@db/schema/website.schema";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { type ErrorType } from "@lib/types/errors";
import { validateCrossDomainTurnstile_WithUserCheck } from "@api-hono/utils/validateTurnstile";
import { getSupportTeamByHostname_Service } from "@db/services/team.service";
import { createWebsite_Service } from "@db/services/website.service";

export const createWebsite_SchemaValidator = zValidator('form', z.object({
    name: insertWebsitesSchema.shape.name,
    turnstile: z.string().min(1, { message: "Verification required" })
}));

export const createWebsite_Handler = async (c: Context<
    HonoVariables,
    "/create",
    ValidatorContext<typeof createWebsite_SchemaValidator>
>) => {
    const { name, turnstile } = c.req.valid('form');
    const { userId } = await validateCrossDomainTurnstile_WithUserCheck(turnstile, c);
    const supportTeam = await getSupportTeamByHostname_Service(c.req.header()['host'])
    return c.json({
        data: await createWebsite_Service(userId, name, supportTeam?.teamId ?? null),
        error: null as ErrorType
    }, 200);
} 