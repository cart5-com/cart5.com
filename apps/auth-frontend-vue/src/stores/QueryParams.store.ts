import { ref } from 'vue'

interface QueryParams {
    auth: "login" | "signup" | "otp" | null;
    type: "ask" | "settings" | "turnstile" | null;
    lang: "en" | null;
    next: string | null;
    state: string | null;
}

export const queryParamsStore = ref<QueryParams>({
    auth: null,
    type: null,
    lang: null,
    next: null,
    state: null,
});

export const getQueryParams = (): QueryParams => {
    const queryParams = new URLSearchParams(window.location.search);
    const entries = Object.fromEntries(queryParams.entries());
    return {
        auth: (entries.auth as "login" | "signup" | "otp") || "login",
        type: (entries.type as "ask" | "settings" | "turnstile") || "settings",
        lang: (entries.lang as "en") || "en",
        next: entries.next || `https://www.${import.meta.env.VITE_PUBLIC_DOMAIN_NAME}/`,
        state: entries.state || null,
    };
}

export const refreshQueryParams = () => {
    queryParamsStore.value = getQueryParams();
}