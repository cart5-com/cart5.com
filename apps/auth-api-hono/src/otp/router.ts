import { Hono } from 'hono'
import type { HonoVariables } from "../index";
import { sendOtpSchemaValidator, sendOtpRoute } from './send';
import { verifyOtpSchemaValidator, verifyOtpRoute } from './verify';

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