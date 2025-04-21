import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { validateCrossDomainTurnstile } from "@api-hono/utils/validateTurnstile";
import type { Context } from "hono";
import { isUserMemberOfTeam_Service } from "@db/services/team.service";
import { createStore_Service } from "@db/services/store.service";
import { KNOWN_ERROR, type ErrorType } from "@lib/types/errors";
import { getWebsiteInfo_Service } from "@db/services/website.service";

export const createStore_SchemaValidator = zValidator('form', z.object({
    name: z.string().min(3, { message: "min 3" }).max(510, { message: "max 510" }),
    turnstile: z.string().min(1, { message: "Verification required" })
}));

export const createStore_Handler = async (c: Context<
    HonoVariables,
    "/create",
    ValidatorContext<typeof createStore_SchemaValidator>
>) => {
    const { name, turnstile } = c.req.valid('form');

    // Validate turnstile and user
    const { userId: requestUserId } = await validateCrossDomainTurnstile(
        turnstile,
        c.req.header()['x-forwarded-for'],
        c.req.header()['user-agent'],
        c.req.header()['host']
    );
    if (requestUserId !== c.get('USER')?.id!) {
        throw new KNOWN_ERROR("Invalid user, please make sure logout and login again", "INVALID_USER");
    }
    if (c.var.USER?.hasVerifiedPhoneNumber === 0) {
        throw new KNOWN_ERROR("has no verified phone number", "HAS_NO_VERIFIED_PHONE_NUMBER");
    }
    const websiteInfo = await getWebsiteInfo_Service(c.req.header()['host'])
    let isUserMemberOfSupportTeam = false;
    if (websiteInfo?.partnerInfo?.partnerTeamId) {
        isUserMemberOfSupportTeam = await isUserMemberOfTeam_Service(requestUserId, websiteInfo?.partnerInfo?.partnerTeamId!)
    }
    return c.json({
        data: await createStore_Service(
            requestUserId,
            name,
            websiteInfo?.partnerInfo?.partnerTeamId ?? null,
            isUserMemberOfSupportTeam,
            // storeId not allowed here
        ),
        error: null as ErrorType
    }, 200);
} 