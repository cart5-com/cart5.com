import { Hono } from 'hono'
import type { HonoVariables } from "../../hono/HonoVariables";
import { sendOtpSchemaValidator, sendOtpRoute } from './send';
import { verifyOtpSchemaValidator, verifyOtpRoute } from './verify';
import { authHostnameCheck } from '../authHostnameCheck';

export const otpRoute = new Hono<HonoVariables>()
    .post(
        '/send',
        authHostnameCheck,
        sendOtpSchemaValidator,
        sendOtpRoute
    )
    .post(
        '/verify',
        authHostnameCheck,
        verifyOtpSchemaValidator,
        verifyOtpRoute
    )