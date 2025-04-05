import { Hono } from 'hono'
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { googleOAuthRoute } from './google_oauth/_router';
import { emailPasswordRoute } from './email_password/_router';
import { otpRoute } from './otp/_router';
import { userRoute } from './user/_router';
import { crossDomainRoute } from './cross_domain/_router';
import { twoFactorAuthRoute } from './two_factor_auth/_router';
import { hostMustBeAuthDomain } from '@api-hono/middlewares/hostMustBeAuthDomain';

export const apiAuth = new Hono<HonoVariables>()
    .use(hostMustBeAuthDomain)
    .route('/cross_domain', crossDomainRoute)
    .route('/email_password', emailPasswordRoute)
    .route('/google_oauth', googleOAuthRoute)
    .route('/otp', otpRoute)
    .route('/two_factor_auth', twoFactorAuthRoute)
    .route('/user', userRoute)

export type ApiAuthType = typeof apiAuth;