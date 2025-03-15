import { defineMiddleware } from "astro:middleware";
import { getWebsiteByDefaultHostname, getRedirectHostname } from "lib/db/dbUtils/getWebsiteByDefaultHostname";
import { IS_PROD } from "lib/utils/getEnvVariable";

export const websiteIdMiddleware = defineMiddleware(async (context, next) => {
    console.log('==============================================');
    console.log('websiteIdMiddleware IS_PROD', IS_PROD);
    console.log('websiteIdMiddleware PUBLIC_DOMAIN_NAME', import.meta.env.PUBLIC_DOMAIN_NAME);
    console.log('==============================================');
    // print all env variables here
    console.log('==============================================');
    console.log('websiteIdMiddleware import.meta.env');
    console.log(import.meta.env);
    console.log('==============================================');
    console.log('==============================================');
    console.log('websiteIdMiddleware process.env');
    console.log(process.env);
    console.log('==============================================');

    const host = context.request.headers.get("Host");
    context.locals.WEBSITE = await getWebsiteByDefaultHostname(host ?? '');
    if (!context.locals.WEBSITE) {
        const redirectHostname = await getRedirectHostname(host ?? '');
        if (redirectHostname) {
            return context.redirect(
                context.request.url.replace(host ?? '', redirectHostname)
            );
        } else {
            return context.redirect(
                context.request.url.replace(host ?? '', import.meta.env.PUBLIC_DOMAIN_NAME)
            );
        }
    }
    return next();
});
