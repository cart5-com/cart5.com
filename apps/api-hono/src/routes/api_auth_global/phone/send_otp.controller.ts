import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { generateNumberOnlyOtp } from '@api-hono/utils/generateRandomOtp';
import { signJwtAndEncrypt } from '@api-hono/utils/jwt';
import { PHONE_OTP_COOKIE_NAME } from '@lib/consts';
import { sendUserOtpSms } from '@api-hono/utils/sms';
import { validateCrossDomainTurnstile } from '@api-hono/utils/validateTurnstile';
import { setCookie } from 'hono/cookie';
import { type ErrorType } from '@lib/types/errors';
import { ENFORCE_HOSTNAME_CHECKS } from '@lib/utils/enforceHostnameChecks';
import { getEnvVariable } from '@lib/utils/getEnvVariable';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import { KNOWN_ERROR } from '@lib/types/errors';
import {
    parsePhoneNumberFromString,
} from 'libphonenumber-js'

export const sendPhoneOtpSchemaValidator = zValidator('form', z.object({
    phoneNumber: z.string().refine(
        (value) => parsePhoneNumberFromString(value)?.isValid(),
        { message: 'Invalid phone number. Please use international format (e.g., +1234567890)' }
    ),
    turnstile: z.string().min(1, { message: "Verification required" })
}))

export const sendPhoneOtpRoute = async (
    c: Context<
        HonoVariables,
        "/phone/send_otp",
        ValidatorContext<typeof sendPhoneOtpSchemaValidator>
    >
) => {
    const { phoneNumber, turnstile } = c.req.valid('form');
    const { userId: requestUserId } = await validateCrossDomainTurnstile(
        turnstile,
        c.req.header()['x-forwarded-for'],
        c.req.header()['user-agent'],
        c.req.header()['host']
    );
    if (requestUserId !== c.get('USER')?.id!) {
        throw new KNOWN_ERROR("Invalid user, please make sure logout and login again", "INVALID_USER");
    }
    // Additional validation using libphonenumber-js
    const parsedNumber = parsePhoneNumberFromString(phoneNumber);
    if (!parsedNumber?.isValid()) {
        throw new KNOWN_ERROR("Invalid phone number", "INVALID_PHONE");
    }

    const otp = generateNumberOnlyOtp(4);

    // Create and encrypt a JWT payload for the phone verification
    const otpToken = await signJwtAndEncrypt<PhoneOtpTokenPayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        {
            userId: requestUserId,
            nonce: crypto.randomUUID(),
            phoneNumber: parsedNumber.number, // Store in E.164 format
            otp,
        }
    );

    // Store the token in a secure cookie
    setCookie(c, PHONE_OTP_COOKIE_NAME, otpToken, {
        path: "/",
        secure: ENFORCE_HOSTNAME_CHECKS,
        httpOnly: true,
        maxAge: 300, // 5 minutes for SMS OTP
        sameSite: "strict"
    });

    try {
        // Send the OTP via SMS
        await sendUserOtpSms(parsedNumber.number, otp);
    } catch (error) {
        throw new KNOWN_ERROR("Failed to send SMS", "SMS_SEND_FAILED");
    }

    return c.json({
        data: "success",
        error: null as ErrorType
    }, 200);
}

export type PhoneOtpTokenPayload = {
    nonce: string;
    userId: string;
    phoneNumber: string;
    otp: string;
} 