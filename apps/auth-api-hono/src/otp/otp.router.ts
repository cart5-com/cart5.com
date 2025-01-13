import { Hono } from 'hono'
import type { HonoVariables } from "../index";
import {
    sendOtpRoute,
    sendOtpSchemaValidator,
    verifyOtpRoute,
    verifyOtpSchemaValidator
} from './otp.controller';

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