import * as Sentry from "@sentry/node";

// Ensure to call this before importing any other modules!
globalThis.globalSentry = Sentry.init({
    dsn: "https://ee1ec52fb9eacfeafc6b29d9061cd4a4@o4509024863518720.ingest.us.sentry.io/4509025267810304",
    environment: process.env.NODE_ENV,
    release: globalThis?.SENTRY_RELEASE?.id || 'unknown',

    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    integrations: [
        // Add our Profiling integration
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#tracesSampleRate
    tracesSampleRate: 1.0,

    // Set profilesSampleRate to 1.0 to profile 100%
    // of sampled transactions.
    // This is relative to tracesSampleRate
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#profilesSampleRate
    profilesSampleRate: 1.0,
});
