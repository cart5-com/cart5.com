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
import { isPhoneNumberVerified_Service } from '@db/services/phone.service';
import { getIpAddress } from '@api-hono/utils/ip_address';

// In-memory storage for IP-based rate limiting
interface IpRecord {
    timestamps: number[];
}

const ipMemoryStore: Record<string, IpRecord> = {};
const MAX_IP_REQUESTS_PER_PERIOD = 15; // Maximum requests allowed per IP per period
const IP_RATE_LIMIT_PERIOD_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// Periodically clean up old records to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const ip in ipMemoryStore) {
        // Filter out timestamps older than the rate limit period
        ipMemoryStore[ip].timestamps = ipMemoryStore[ip].timestamps.filter(
            timestamp => now - timestamp < IP_RATE_LIMIT_PERIOD_MS
        );

        // Remove entry if no timestamps remain
        if (ipMemoryStore[ip].timestamps.length === 0) {
            delete ipMemoryStore[ip];
        }
    }
}, 60 * 60 * 1000); // Clean up every hour

// Check if an IP has exceeded rate limits
const hasIpExceededRateLimit = (ip: string): boolean => {
    const now = Date.now();

    // If IP doesn't exist in store, create it
    if (!ipMemoryStore[ip]) {
        ipMemoryStore[ip] = { timestamps: [] };
        return false;
    }

    // Filter timestamps to only include those within the rate limit period
    const recentTimestamps = ipMemoryStore[ip].timestamps.filter(
        timestamp => now - timestamp < IP_RATE_LIMIT_PERIOD_MS
    );

    // Update the store with filtered timestamps
    ipMemoryStore[ip].timestamps = recentTimestamps;

    // Check if IP has exceeded the max requests allowed
    return recentTimestamps.length >= MAX_IP_REQUESTS_PER_PERIOD;
};

// Record a new request from an IP
const recordIpRequest = (ip: string): void => {
    if (!ipMemoryStore[ip]) {
        ipMemoryStore[ip] = { timestamps: [] };
    }

    ipMemoryStore[ip].timestamps.push(Date.now());
};

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
    const IP_ADDRESS = getIpAddress(c);

    // Check for IP-based rate limiting
    if (hasIpExceededRateLimit(IP_ADDRESS)) {
        throw new KNOWN_ERROR("Too many requests from this IP. Please try again after 1 hour.", "IP_RATE_LIMIT_EXCEEDED");
    }

    const { userId: requestUserId } = await validateCrossDomainTurnstile(
        turnstile,
        IP_ADDRESS,
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

    const isPhoneNumberVerifiedBefore = await isPhoneNumberVerified_Service(parsedNumber.number);
    if (isPhoneNumberVerifiedBefore) {
        throw new KNOWN_ERROR("Phone number already verified", "PHONE_NUMBER_ALREADY_VERIFIED");
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
        // Record the IP request before sending SMS
        recordIpRequest(IP_ADDRESS);

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