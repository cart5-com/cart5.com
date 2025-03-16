import { Hono } from 'hono'
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { sendOtpSchemaValidator, sendOtpRoute } from './send.controller';
import { verifyOtpSchemaValidator, verifyOtpRoute } from './verify.controller';

export const otpRoute = new Hono<HonoVariables>()
    .post(
        '/send',
        sendOtpSchemaValidator,
        sendOtpRoute
    )
    .post(
        '/verify',
        verifyOtpSchemaValidator,
        verifyOtpRoute
    )