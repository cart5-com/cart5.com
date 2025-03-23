import { createMiddleware } from 'hono/factory'
import { Toucan } from 'toucan-js'

export const sentryMiddleware = createMiddleware(async (c, next) => {
    let hasExecutionContext = true
    try {
        c.executionCtx
    } catch {
        hasExecutionContext = false
    }
    const sentry = new Toucan({
        dsn: "https://ee1ec52fb9eacfeafc6b29d9061cd4a4@o4509024863518720.ingest.us.sentry.io/4509025267810304",
        environment: process.env.NODE_ENV,
        release: globalThis?.SENTRY_RELEASE?.id || 'unknown',
        requestDataOptions: {
            allowedCookies: true,
            allowedHeaders: true,
            allowedSearchParams: true,
            allowedIps: true,
        },
        request: c.req.raw,
        context: hasExecutionContext ? c.executionCtx : {
            waitUntil: async function (promise: Promise<any>): Promise<void> {
                await promise;
            }
        },
    });

    const originalConsoleLog = console.log;
    console.log = (...args) => {
        originalConsoleLog(...args);
        sentry?.addBreadcrumb({
            category: 'console',
            message: args.join(' '),
            level: 'info',
        });
    };
    const originalConsoleInfo = console.info;
    console.info = (...args) => {
        originalConsoleInfo(...args);
        sentry?.addBreadcrumb({
            category: 'console',
            message: args.join(' '),
            level: 'info',
        });
    };
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
        originalConsoleWarn(...args);
        sentry?.addBreadcrumb({
            category: 'console',
            message: args.join(' '),
            level: 'warning', // 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'
        });
    };
    const originalConsoleError = console.error;
    console.error = (...args) => {
        originalConsoleError(...args);
        sentry?.addBreadcrumb({
            category: 'console',
            message: args.join(' '),
            level: 'error',
        });
    };
    c.set('sentry', sentry)

    await next()

    if (c.error) {
        console.log('sentry.captureException❌❌❌❌❌❌❌❌❌');
        sentry?.captureException(c.error);
    }
});