import { atom } from 'nanostores'

interface QueryParams {
    auth: "login" | "signup" | "otp" | null;
    type: "ask" | "settings" | null;
    next: string | null;
}

export const $queryParamsStore = atom<QueryParams>({
    auth: null,
    type: null,
    next: null
});

export const getQueryParams = (): QueryParams => {
    const queryParams = new URLSearchParams(window.location.search);
    const entries = Object.fromEntries(queryParams.entries());
    return {
        auth: (entries.auth as "login" | "signup" | "otp") || "login",
        type: (entries.type as "ask" | "settings") || "settings",
        next: entries.next || `https://www.${import.meta.env.PUBLIC_DOMAIN_NAME}/`
    };
}

export const refreshQueryParams = () => {
    $queryParamsStore.set(getQueryParams());
}
