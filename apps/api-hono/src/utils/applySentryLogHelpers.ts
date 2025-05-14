import { type Toucan } from "toucan-js";

export const applySentryLogHelpers = (sentry: Toucan) => {
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
}
