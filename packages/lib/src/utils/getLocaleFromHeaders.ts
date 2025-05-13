export const getLocaleFromHeaders = (
    acceptLanguageHeader: string | null | undefined,
    defaultLocale = 'en-US'
): string => {
    if (!acceptLanguageHeader) {
        return defaultLocale;
    }
    try {
        const locales = acceptLanguageHeader.split(',');
        if (locales.length === 0) {
            return defaultLocale;
        }
        const primaryLocale = locales[0]?.split(';')[0]?.trim();
        return primaryLocale || defaultLocale;
    } catch (error) {
        return defaultLocale;
    }
};