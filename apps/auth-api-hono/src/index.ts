import { serve } from '@hono/node-server'
import { Hono } from "hono";
import { csrfChecks } from "./middlewares/csrf";
import { authChecks } from './middlewares/auth';
import { secureHeaders } from 'hono/secure-headers'
import { KNOWN_ERROR } from 'lib/errors';
import { userRoute } from 'lib/auth/user/router';
import { otpRoute } from 'lib/auth/otp/router';
import { emailPasswordRoute } from 'lib/auth/emailPassword/router';
import { crossDomainRoute } from 'lib/auth/crossDomain/router';
import { googleOAuthRoute } from 'lib/auth/googleOAuth/router';
import { twoFactorAuthRoute } from 'lib/auth/twoFactorAuth/router';
import { authBearerTokenChecks } from './middlewares/authBearerToken';
import { hostnameCheck } from './middlewares/hostnameCheck';
import { ENFORCE_HOSTNAME_CHECKS } from 'lib/auth/enforceHostnameChecks';
import { IS_PROD } from 'lib/utils/getEnvVariable';
import type { HonoVariables } from 'lib/hono/HonoVariables';
const app = new Hono<HonoVariables>();

app.use(hostnameCheck);
app.use(csrfChecks);
app.use(authChecks);
// NOTE: authBearerTokenChecks must be after authChecks
app.use(authBearerTokenChecks);
app.use(secureHeaders());

app.onError((err, c) => {
	if (err instanceof KNOWN_ERROR) {
		console.log("KNOWN_ERROR err:");
		console.log(err);
		c.error = undefined;
		return c.json({
			error: {
				message: err.message,
				code: err.code
			},
		}, 500);
	} else {
		// this is same with hono's own error handler. 
		// but i like JSON
		if ("getResponse" in err) {
			return err.getResponse();
		}
		console.error(err);
		return c.json({
			error: {
				message: "Internal Server Error"
			},
		}, 503);
	}
})

app.get("/", (c) => {
	return c.html(`Hello ${IS_PROD ? "PROD" : "DEV"} ${ENFORCE_HOSTNAME_CHECKS ? "ENFORCE_HOSTNAME_CHECKS" : "NO_ENFORCE_HOSTNAME_CHECKS"}`);
});

const routes = app.basePath('/api')
	.route('/user', userRoute)
	.route('/otp', otpRoute)
	.route('/email_password', emailPasswordRoute)
	.route('/cross_domain', crossDomainRoute)
	.route('/google_oauth', googleOAuthRoute)
	.route('/two_factor_auth', twoFactorAuthRoute)

export type AuthApiAppType = typeof routes;

const port = 3000;
serve({
	fetch: app.fetch,
	port: port
}, (info) => {
	console.log(`Api hono server is running on 
		http://127.0.0.1:${info.port} 
		address:${info.address} 
		family:${info.family}`);
});