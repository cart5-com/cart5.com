import { type Context } from 'hono'
import { encodeBase64, encodeBase32NoPadding } from "@oslojs/encoding";
import { createTOTPKeyURI } from "@oslojs/otp";
import { renderSVG } from "uqr";
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import { getEnvVariable } from '@lib/utils/getEnvVariable';
import type { HonoVariables } from "@api-hono/types/HonoVariables";

export const newTwoFactorAuthRoute = async (c: Context<HonoVariables>) => {
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (!user.hasNewSession) {
        throw new KNOWN_ERROR("A fresh login is required", "FRESH_SESSION_REQUIRED");
    }
    if (user.has2FA) {
        throw new KNOWN_ERROR("User already has 2FA enabled", "USER_ALREADY_HAS_2FA_ENABLED");
    }
    const totpKey = new Uint8Array(20);
    crypto.getRandomValues(totpKey);
    const encodedTOTPKey = encodeBase64(totpKey);
    const keyURI = createTOTPKeyURI(`auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')}`, user.email, totpKey, 30, 6);
    return c.json({
        data: {
            qrCodeSVG: renderSVG(keyURI),
            encodedTOTPKey,
            totpKey: encodeBase32NoPadding(totpKey),
            name: `auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')} - ${user.email}`,
        },
        error: null as ErrorType
    }, 200);
}
