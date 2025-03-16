import { Hono } from 'hono'
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { googleOAuthRoute } from './google_oauth/router';
import { emailPasswordRoute } from './email_password/router';
import { otpRoute } from './otp/router';
import { userRoute } from './user/router';
import { crossDomainRoute } from './cross_domain/router';
import { twoFactorAuthRoute } from './two_factor_auth/router';

export const apiAuth = new Hono<HonoVariables>()
    .route('/cross_domain', crossDomainRoute)
    .route('/email_password', emailPasswordRoute)
    .route('/google_oauth', googleOAuthRoute)
    .route('/otp', otpRoute)
    .route('/two_factor_auth', twoFactorAuthRoute)
    .route('/user', userRoute)