import { apiClient } from "@api-client/index";
import { ref, watch } from "vue";
import type { ResType } from "@api-client/index";
import { toast } from "@/ui-plus/sonner";

export type UserDataStoreType = ResType<typeof apiClient.auth_global.get_user_data.$post>["data"];
export type UserDataType = UserDataStoreType["userData"];
export type AnonUserDataType = Pick<NonNullable<UserDataType>, "rememberLastAddressId" | "addressArray">;

export const userDataStore = ref<UserDataStoreType>({
    user: null,
    userData: null,
});

const DEFAULT_USERLOCAL_DATA: AnonUserDataType = {
    rememberLastAddressId: null,
    addressArray: [],
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
const saveToLocalStorage = (data: AnonUserDataType | null) => {
    if (typeof localStorage === 'undefined') return;
    if (!data) return;
    if (debounceTimeoutLocalStorage) {
        clearTimeout(debounceTimeoutLocalStorage);
    }
    debounceTimeoutLocalStorage = setTimeout(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }, 500);
}

const mergedUserData = (
    anonUserData: AnonUserDataType,
    serverUserData: UserDataType
): AnonUserDataType => {
    if (!serverUserData) {
        return anonUserData;
    }
    return {
        rememberLastAddressId: serverUserData.rememberLastAddressId,
        addressArray: serverUserData.addresses,
    }
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
                rememberLastAddressId: true,
                addresses: true,
            }
        }
    })).json();
    if (error) {
        console.error(error);
        toast.error("Failed to load user data");
    }
    if (isAfterLogin) {
        mergeUserData(loadFromLocalStorage(), data.userData);
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
    watch(userDataStore, (newVal) => {
        if (newVal.user) {
            saveUserData(newVal);
        } else {
            saveToLocalStorage(newVal.userData);
        }
    }, { deep: true, immediate: false });
}

let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
const saveUserData = async (newVal: UserDataStoreType) => {
    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(async () => {
        const { error } = await (await apiClient.auth_global.update_user_data.$patch({
            json: {
                ...newVal.userData,
            }
        })).json();
        if (error) {
            console.error(error);
            toast.error("Failed to save user data");
        }
    }, 1000);
}

loadUserData();

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
}