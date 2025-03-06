// import { createMiddleware } from "hono/factory";
// import { createAuthApiClient } from 'lib/hono/apiClients/authApiClient'
// import { SESSION_COOKIE_NAME } from "lib/consts/auth-consts";
// import { getCookie } from "hono/cookie";
// import type { HonoVariables } from 'lib/hono/HonoVariables';
// import { getEnvVariable } from "lib/utils/getEnvVariable";


// export const authInternalSample = createMiddleware<HonoVariables>(async (c, next) => {
//     const cookieValue = getCookie(c, SESSION_COOKIE_NAME) ?? null;
//     // Skip auth check if no session cookie exists
//     if (!cookieValue) {
//         // if no session cookie, set user to null
//         c.set('USER', null);
//         await next();
//     } else {
//         // if session cookie exists, fetch user data
//         try {
//             const authCookieValue = cookieValue;
//             const authApiClient = createAuthApiClient(getEnvVariable("INTERNAL_AUTH_API_ORIGIN"));
//             const { data } = await (await authApiClient.api_auth.user.whoami.$post({}, {
//                 headers: {
//                     "internal-auth-api-key": getEnvVariable("INTERNAL_AUTH_API_KEY"),
//                     "internal-host": c.req.header()['host'],
//                     "authorization": `Bearer ${authCookieValue}`
//                 }
//             })).json();
//             c.set('USER', data);
//             await next();
//         } catch (e) {
//             console.log('Auth middleware error:', e);
//             c.set('USER', null);
//             await next();
//         }
//     }
// });