export function getQueryParams() {
    const currentUrl = new URL(window.location.href)
    const queryParams = currentUrl.searchParams
    return queryParams
}

export function getNextUrl() {
    const queryParams = getQueryParams()
    return queryParams.get('next')
}

export function getNextHostname() {
    const nextUrl = getNextUrl()
    if (!nextUrl) return null
    return new URL(nextUrl).hostname
}