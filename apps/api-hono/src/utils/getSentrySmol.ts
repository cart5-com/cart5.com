// TODO: remove this file
// import { Toucan } from "toucan-js";
// import { applySentryLogHelpers } from "./applySentryLogHelpers";

// export const getSentrySmol = () => {
//     console.log('getSentrySmol initilizing');
//     const sentry = new Toucan({
//         dsn: "https://ee1ec52fb9eacfeafc6b29d9061cd4a4@o4509024863518720.ingest.us.sentry.io/4509025267810304",
//         environment: process.env.NODE_ENV,
//         release: globalThis?.SENTRY_RELEASE?.id || 'unknown',
//         requestDataOptions: {
//             allowedCookies: true,
//             allowedHeaders: true,
//             allowedSearchParams: true,
//             allowedIps: true,
//         },
//     })
//     applySentryLogHelpers(sentry);
//     return sentry;
// }

// export const sentrySmol = getSentrySmol();