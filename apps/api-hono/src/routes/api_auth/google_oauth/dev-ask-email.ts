import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { IS_PROD } from '@lib/utils/getEnvVariable';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';



export const devAskEmailSchemaValidator = zValidator('query', z.object({
    redirect_uri: z.string().min(1),
}));
export const devAskEmailRoute = async (
    c: Context<
        HonoVariables,
        "/dev-ask-email",
        ValidatorContext<typeof devAskEmailSchemaValidator>
    >
) => {
    if (IS_PROD) {
        return c.text('not allowed in prod');
    } else {
        const { redirect_uri } = c.req.valid('query');
        return c.html(`<html>
                    <head>
                        <title>simulate Google OAuth dev</title>
                    </head>
                    <body>
                        <form action="/__p_api/api_auth/google_oauth/simulate-google-oauth-callback" method="get">
                            <label for="email">Email:</label>
                        <br />
                        <input type="text" id="email" name="email" placeholder="email" />
                        <br />
                        <br />
                        <!-- <label for="redirect_uri">Redirect URI:</label> -->
                        <br />
                        <input type="hidden" id="redirect_uri" name="redirect_uri" placeholder="redirect_uri" value="${redirect_uri}" />
                        <br />
                        <br />
                        <button type="submit">submit</button>
                    </form>
                </body>
                </html>`);
    }
}