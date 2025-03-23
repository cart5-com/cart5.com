import { insertWebsitesSchema } from "@db/schema/website.schema";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { KNOWN_ERROR, type ErrorType } from "@lib/types/errors";
import { validateCrossDomainTurnstile } from "@api-hono/utils/validateTurnstile";
import { isUserMemberOfTeam_Service } from "@db/services/team.service";
import { createWebsite_Service, getWebsiteInfo_Service } from "@db/services/website.service";

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
    const { userId: requestUserId } = await validateCrossDomainTurnstile(
        turnstile,
        c.req.header()['x-forwarded-for'],
        c.req.header()['user-agent'],
        c.req.header()['host']
    );
    if (requestUserId !== c.get('USER')?.id!) {
        throw new KNOWN_ERROR("Invalid user", "INVALID_USER");
    }
    const websiteInfo = await getWebsiteInfo_Service(c.req.header()['host'])
    let isUserMemberOfSupportTeam = false;
    if (websiteInfo?.partnerInfo?.partnerTeamId) {
        isUserMemberOfSupportTeam = await isUserMemberOfTeam_Service(requestUserId, websiteInfo?.partnerInfo?.partnerTeamId!)
    }
    return c.json({
        data: await createWebsite_Service(
            requestUserId,
            name,
            websiteInfo?.partnerInfo?.partnerTeamId ?? null,
            isUserMemberOfSupportTeam,
            // websiteId not allowed here
        ),
        error: null as ErrorType
    }, 200);
} 