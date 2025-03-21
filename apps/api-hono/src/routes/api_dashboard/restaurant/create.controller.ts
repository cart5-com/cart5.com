import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { validateCrossDomainTurnstile } from "@api-hono/utils/validateTurnstile";
import type { Context } from "hono";
import { getSupportTeamByHostname_Service, isUserMemberOfTeam_Service } from "@db/services/team.service";
import { createRestaurant_Service } from "@db/services/restaurant.service";
import { KNOWN_ERROR, type ErrorType } from "@lib/types/errors";

export const createRestaurant_SchemaValidator = zValidator('form', z.object({
    name: z.string().min(3, { message: "min 3" }).max(510, { message: "max 510" }),
    turnstile: z.string().min(1, { message: "Verification required" })
}));

export const createRestaurant_Handler = async (c: Context<
    HonoVariables,
    "/create",
    ValidatorContext<typeof createRestaurant_SchemaValidator>
>) => {
    const { name, turnstile } = c.req.valid('form');

    // Validate turnstile and user
    const { userId: ownerUserId } = await validateCrossDomainTurnstile(
        turnstile,
        c.req.header()['x-forwarded-for'],
        c.req.header()['user-agent'],
        c.req.header()['host']
    );
    if (ownerUserId !== c.get('USER')?.id!) {
        throw new KNOWN_ERROR("Invalid user", "INVALID_USER");
    }
    const supportTeam = await getSupportTeamByHostname_Service(c.req.header()['host'])
    let isUserMemberOfSupportTeam = false;
    if (supportTeam) {
        isUserMemberOfSupportTeam = await isUserMemberOfTeam_Service(ownerUserId, supportTeam?.teamId!)
    }
    return c.json({
        data: await createRestaurant_Service(
            ownerUserId, name,
            supportTeam?.teamId ?? null,
            isUserMemberOfSupportTeam,
            // restaurantId not allowed here
        ),
        error: null as ErrorType
    }, 200);
} 