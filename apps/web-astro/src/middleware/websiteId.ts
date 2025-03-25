import { defineMiddleware } from "astro:middleware";
import { getWebsiteByDefaultHostname, getRedirectHostname } from "@db/services/website.service";

export const websiteIdMiddleware = defineMiddleware(async (context, next) => {
    const host = context.request.headers.get("Host");
    context.locals.WEBSITE = await getWebsiteByDefaultHostname(host ?? '');
    if (!context.locals.WEBSITE) {
        const redirectHostname = await getRedirectHostname(host ?? '');
        if (redirectHostname) {
            return context.redirect(
                context.request.url.replace(host ?? '', redirectHostname)
            );
        } else {
            if (host !== `www.${import.meta.env.PUBLIC_DOMAIN_NAME}`) {
                return context.redirect(
                    context.request.url.replace(host ?? '', `www.${import.meta.env.PUBLIC_DOMAIN_NAME}`)
                );
            }
        }
    }
    return next();
});
