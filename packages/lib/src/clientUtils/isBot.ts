export function isBot(userAgent?: string | null): boolean {
    if (!userAgent) return false;

    const userAgentLower = userAgent.toLowerCase();

    // List of common bot/crawler identifiers in user agent strings
    const botPatterns = [
        'bot',
        'spider',
        'crawler',
        'scraper',
        'slurp',
        'googlebot',
        'bingbot',
        'yandex',
        'baidu',
        'duckduckbot',
        'facebookexternalhit',
        'twitterbot',
        'rogerbot',
        'linkedinbot',
        'embedly',
        'headless',
        'phantomjs',
        'puppeteer',
        'selenium',
        'chrome-lighthouse',
        'pingdom',
        'health',
        'monitor',
        'prerender',
        'ahrefsbot',
        'semrushbot',
        'screaming frog',
        'bytespider',
        'applebot',
        'telegrambot',
    ];

    return botPatterns.some(pattern => userAgentLower.includes(pattern));
}

// export function isSearchEngineBot(userAgent?: string | null): boolean {
//     if (!userAgent) return false;

//     const userAgentLower = userAgent.toLowerCase();

//     const searchBots = [
//         'googlebot',
//         'bingbot',
//         'yandexbot',
//         'baiduspider',
//         'duckduckbot',
//         'applebot',
//         'sogou',
//         'exabot',
//     ];

//     return searchBots.some(pattern => userAgentLower.includes(pattern));
// }

