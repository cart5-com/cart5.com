import { defineMiddleware } from "astro:middleware";
import { getWebsiteByDefaultHostname, getRedirectHostname } from "lib/db/dbUtils/getWebsiteByDefaultHostname";
import { IS_PROD } from "lib/utils/getEnvVariable";

export const websiteIdMiddleware = defineMiddleware(async (context, next) => {
    const host = context.request.headers.get("Host");
    // context.locals.WEBSITE = await getWebsiteByDefaultHostname(host ?? '');
    // if (!context.locals.WEBSITE) {
    //     const redirectHostname = await getRedirectHostname(host ?? '');
    //     if (redirectHostname) {
    //         return context.redirect(
    //             context.request.url.replace(host ?? '', redirectHostname)
    //         );
    //     } else {
    //         return context.redirect(
    //             context.request.url.replace(host ?? '', import.meta.env.PUBLIC_DOMAIN_NAME)
    //         );
    //     }
    // }
    return next();
});
