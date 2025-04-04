import { apiClient } from "@api-client/index";
import { ref, watch } from "vue";
import type { ResType } from "@api-client/index";
import { toast } from "@/ui-plus/sonner";
import { deepMerge } from "@lib/utils/deepMerge";
import { ipwhois } from "@/ui-plus/geolocation-selection-map/ipwhois";
import { BASE_LINKS } from "@web-astro/utils/links";

export type UserDataStoreType = ResType<typeof apiClient.auth_global.get_user_data.$post>["data"];
export type UserDataType = UserDataStoreType["userData"];


export type AnonUserDataType = Pick<NonNullable<UserDataType>,
    "rememberLastLat" |
    "rememberLastLng" |
    "rememberLastAddress" |
    "rememberLastCountry" |
    "carts"
>;

export const userDataStore = ref<UserDataStoreType>({
    user: null,
    userData: null,
});

const DEFAULT_USERLOCAL_DATA: AnonUserDataType = {
    rememberLastLat: null,
    rememberLastLng: null,
    rememberLastAddress: null,
    rememberLastCountry: null,
    carts: {},
}

const LOCAL_STORAGE_KEY = "ANON_USER_DATA_V1";

const loadFromLocalStorage = (): AnonUserDataType => {
    if (typeof localStorage === 'undefined') {
        return DEFAULT_USERLOCAL_DATA;
    }
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_USERLOCAL_DATA;
    } catch (e) {
        return DEFAULT_USERLOCAL_DATA;
    }
}

let debounceTimeoutLocalStorage: ReturnType<typeof setTimeout> | null = null;
const saveToLocalStorage = (data: UserDataType | null) => {
    if (typeof localStorage === 'undefined') return;
    if (!data) return;
    if (debounceTimeoutLocalStorage) {
        clearTimeout(debounceTimeoutLocalStorage);
    }
    debounceTimeoutLocalStorage = setTimeout(() => {
        saveToLocalStorageNow(data);
    }, 500);
}
const saveToLocalStorageNow = (data: UserDataType | null) => {
    if (typeof localStorage === 'undefined') return;
    if (!data) return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

const mergedUserData = (
    anonUserData: AnonUserDataType,
    serverUserData: UserDataType
): AnonUserDataType => {
    if (!serverUserData) {
        return anonUserData;
    }
    const formattedServerData: AnonUserDataType = {
        rememberLastLat: serverUserData.rememberLastLat,
        rememberLastLng: serverUserData.rememberLastLng,
        rememberLastAddress: serverUserData.rememberLastAddress,
        rememberLastCountry: serverUserData.rememberLastCountry,
        carts: serverUserData.carts ?? {},
    };
    return deepMerge(anonUserData, formattedServerData);
}

const loadUserData = async () => {
    if (import.meta.env.SSR) return;
    const isAfterLogin = typeof window !== 'undefined' && window.location.hash === '#after-login';
    if (isAfterLogin && typeof window !== 'undefined') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    const { data, error } = await (await apiClient.auth_global.get_user_data.$post({
        json: {
            columns: {
                rememberLastAddress: true,
                rememberLastCountry: true,
                rememberLastLat: true,
                rememberLastLng: true,
            }
        }
    })).json();
    if (error) {
        console.error(error);
        toast.error("Failed to load user data");
    }
    if (isAfterLogin) {
        userDataStore.value.userData = mergedUserData(loadFromLocalStorage(), data.userData) as UserDataType;
        // remove local storage data
        await saveUserDataNow(userDataStore.value);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        if (window.location.pathname === BASE_LINKS.LIST_STORES) {
            window.location.href = BASE_LINKS.HOME;
        }
    } else {
        if (!data.user) {
            userDataStore.value.userData = loadFromLocalStorage() as UserDataType;
        } else {
            userDataStore.value = data;
            if (!data.userData) {
                (userDataStore.value.userData as any) = {};
            }
        }
    }
    watch(userDataStore, handleDataChange, { deep: true, immediate: false });
}

export const handleDataChange = (newVal: UserDataStoreType) => {
    if (newVal.user) {
        saveUserData(newVal);
    } else {
        saveToLocalStorage(newVal.userData);
    }
}

export const handleDataChangeNow = async (newVal: UserDataStoreType) => {
    if (newVal.user) {
        await saveUserDataNow(newVal);
    } else {
        saveToLocalStorageNow(newVal.userData);
    }
}


let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
const saveUserData = async (newVal: UserDataStoreType) => {
    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(async () => {
        saveUserDataNow(newVal);
    }, 1000);
}

export const saveUserDataNow = async (data: UserDataStoreType) => {
    const { error } = await (await apiClient.auth_global.update_user_data.$patch({
        json: {
            ...data.userData,
        }
    })).json();
    if (error) {
        console.error(error);
        toast.error("Failed to save user data");
    }
}

export const logoutAll = async () => {
    const { error } = await (await apiClient.auth_global["logout-all"].$post()).json();
    if (error) {
        console.error(error);
        toast.error("Failed to logout");
    }
    userDataStore.value = {
        user: null,
        userData: null,
    };
    (userDataStore.value.userData as any) = loadFromLocalStorage() as UserDataType;
    await loadCountryFromIp();
}

export const loadCountryFromIp = async () => {
    if (!userDataStore.value?.userData?.rememberLastCountry) {
        const ipwho = await ipwhois()
        if (userDataStore.value?.userData && ipwho.country_code) {
            userDataStore.value.userData.rememberLastCountry = ipwho.country_code
        }
    }
}


loadUserData();