export function getQueryParams() {
    const currentUrl = new URL(window.location.href)
    const queryParams = currentUrl.searchParams
    return queryParams
}

export function getRedirectUrl() {
    const queryParams = getQueryParams()
    return queryParams.get('redirect')
}

export function getRedirectHostname() {
    const redirectUrl = getRedirectUrl()
    if (!redirectUrl) return document.referrer.split('/')[2]
    return new URL(redirectUrl).hostname
}
