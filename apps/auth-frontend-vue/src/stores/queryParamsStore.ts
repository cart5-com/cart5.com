import { ref } from 'vue'

interface QueryParams {
    auth: "login" | "signup" | "otp" | null;
    type: "ask" | "settings" | null;
    lang: "en" | null;
    next: string | null;
}

export const queryParamsStore = ref<QueryParams>({
    auth: null,
    type: null,
    lang: null,
    next: null,
});

export const getQueryParams = (): QueryParams => {
    const queryParams = new URLSearchParams(window.location.search);
    const entries = Object.fromEntries(queryParams.entries());
    return {
        auth: (entries.auth as "login" | "signup" | "otp") || "login",
        type: (entries.type as "ask" | "settings") || "settings",
        lang: (entries.lang as "en") || "en",
        next: entries.next || `https://www.${import.meta.env.VITE_PUBLIC_DOMAIN_NAME}/`
    };
}

export const refreshQueryParams = () => {
    queryParamsStore.value = getQueryParams();
}