export const getAuthOrigin = (PUBLIC_DOMAIN_NAME: string) => {
    if (window.location.host.includes(':')) {
        // Local development with port number
        return 'http://localhost:3001';
    } else if (window.location.host.includes('3002.app.github.dev')) {
        // github codespaces
        return window.location.origin.replace('3002', '3001');
    } else {
        // Production or other environments
        return `https://auth.${PUBLIC_DOMAIN_NAME}`;
    }
}

export const getLoginUrl = (PUBLIC_DOMAIN_NAME: string) => {
    return `${getAuthOrigin(PUBLIC_DOMAIN_NAME)}/?next=${encodeURIComponent(window.location.href)
        }&type=ask&auth=login`;;
}

export const getTurnstileUrl = (PUBLIC_DOMAIN_NAME: string) => {
    // remove query params from url
    const url = new URL(window.location.href);
    url.search = '';
    return `${getAuthOrigin(PUBLIC_DOMAIN_NAME)}/?next=${encodeURIComponent(url.toString())
        }&type=turnstile`;
}

// const returnUrl = encodeURIComponent(window.location.href);
// window.location.href = `${getAuthOrigin(import.meta.env.PUBLIC_DOMAIN_NAME)}/?next=${returnUrl}&type=settings`;
export const getSettingsUrl = (PUBLIC_DOMAIN_NAME: string) => {
    return `${getAuthOrigin(PUBLIC_DOMAIN_NAME)}/?next=${encodeURIComponent(window.location.href)}&type=settings`;
}

export const getSignupUrl = (PUBLIC_DOMAIN_NAME: string) => {
    return `${getAuthOrigin(PUBLIC_DOMAIN_NAME)}/?next=${encodeURIComponent(window.location.href)}&type=ask&auth=signup`;
}
