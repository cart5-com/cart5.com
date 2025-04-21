import { Hono } from 'hono';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { sendPhoneOtpSchemaValidator, sendPhoneOtpRoute } from './send_otp.controller';
import { verifyPhoneOtpSchemaValidator, verifyPhoneOtpRoute } from './verify_otp.controller';
import { mustHaveUser } from '@api-hono/middlewares/mustHaveUser';

export const phoneRoute = new Hono<HonoVariables>()
    // Routes that require authentication
    .use(mustHaveUser)
    .post(
        '/send_otp',
        sendPhoneOtpSchemaValidator,
        sendPhoneOtpRoute
    )
    .post(
        '/verify_otp',
        verifyPhoneOtpSchemaValidator,
        verifyPhoneOtpRoute
    )