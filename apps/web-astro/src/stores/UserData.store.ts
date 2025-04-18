import { authGlobalApiClient } from "@api-client/auth_global";
import { ref, watch } from "vue";
import type { ResType } from "@api-client/typeUtils";
import { toast } from "@/ui-plus/sonner";
import { deepMerge } from "@lib/utils/deepMerge";
import { ipwhois } from "@/ui-plus/geolocation-selection-map/ipwhois";
import { BASE_LINKS } from "@web-astro/utils/links";
import { isBot } from "@lib/clientUtils/isBot";
import { cleanEmptyProps } from "@lib/utils/cleanEmptyProps";
/*
loadUserData() is called at initialization:
Fetches user data from the server
Handles special case for post-login state (#after-login hash)
Merges anonymous data with server data after login
Sets up a watcher to detect and save changes

mergedUserData() combines anonymous and server data:
Preserves all server carts
Adds missing anonymous carts
Merges items for carts that exist in both

loadCountryFromIp() retrieves location data if not already set
*/


let pendingSave = false;
// Prevent page unload until data is saved
if (typeof window !== 'undefined') {
    window.onbeforeunload = (e) => {
        if (pendingSave) {
            // Cancel the event and show confirmation dialog
            e.preventDefault();
            // Chrome requires returnValue to be set
            e.returnValue = '';
            return '';
        }
        return undefined;
    };
}

export type UserDataStoreType = ResType<typeof authGlobalApiClient.get_user_data.$post>["data"];
export type UserDataType = UserDataStoreType["userData"];


export type AnonUserDataType = Pick<NonNullable<UserDataType>,
    "rememberLastLat" |
    "rememberLastLng" |
    "rememberLastAddress" |
    "rememberLastCountry" |
    "carts"
>;

export const ON_USER_DATA_READY = "ON_USER_DATA_READY";
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

    pendingSave = true;

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
    pendingSave = false;
}

const mergedUserData = (
    anonUserData: AnonUserDataType,
    serverUserData: UserDataType
): AnonUserDataType => {
    if (!serverUserData) {
        return anonUserData;
    }
    // merge serverUserData.carts.items with anonUserData.carts.items

    const formattedServerData: AnonUserDataType = {
        rememberLastLat: serverUserData.rememberLastLat,
        rememberLastLng: serverUserData.rememberLastLng,
        rememberLastAddress: serverUserData.rememberLastAddress,
        rememberLastCountry: serverUserData.rememberLastCountry,
        carts: {},
    };


    // Start with all server carts
    formattedServerData.carts = { ...(serverUserData.carts || {}) };

    // Merge anonymous carts with server carts
    for (const [cartId, anonCart] of Object.entries(anonUserData.carts || {})) {
        if (!formattedServerData.carts[cartId]) {
            // If cart doesn't exist in server data, add the entire anonymous cart
            formattedServerData.carts[cartId] = { ...anonCart };
        } else {
            // If cart exists in both, merge their items
            const serverCart = formattedServerData.carts[cartId];
            const mergedItems = [...(serverCart.items || [])];

            // Add unique items from anonymous cart
            (anonCart.items || []).forEach(anonItem => {
                // You might want to add more sophisticated duplicate detection logic here
                // For now, we'll just append all anonymous items
                mergedItems.push({ ...anonItem });
            });

            // Update the cart with merged items
            formattedServerData.carts[cartId] = {
                ...serverCart,
                items: mergedItems,
                // Preserve anonymous cart note if server cart has none
                orderNote: serverCart.orderNote || anonCart.orderNote || "",
            };
        }
    }


    return deepMerge(anonUserData, formattedServerData);
}

const loadUserData = async () => {
    if (import.meta.env.SSR) return;
    const isAfterLogin = typeof window !== 'undefined' && window.location.hash === '#after-login';
    if (isBot()) {
        console.warn("Bot detected, skipping user data load");
        return;
    };
    const { data, error } = await (await authGlobalApiClient.get_user_data.$post({
        json: {
            columns: {
                rememberLastAddress: true,
                rememberLastCountry: true,
                rememberLastLat: true,
                rememberLastLng: true,
                carts: true,
            }
        }
    })).json();
    if (error) {
        console.error(error);
        toast.error("Failed to load user data please refresh the page");
    } else {
        if (isAfterLogin && typeof window !== 'undefined') {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        if (
            isAfterLogin ||
            (
                // may login /dashboard/ etc.. with another tab
                // dashboard or other apps does not have same user merge handling
                localStorage.hasOwnProperty(LOCAL_STORAGE_KEY) &&
                data.user
            )
        ) {
            userDataStore.value.userData = mergedUserData(loadFromLocalStorage(), data.userData) as UserDataType;
            userDataStore.value.user = data.user;
            // save latest user data
            await saveUserDataNow(userDataStore.value);

            // remove local storage data
            localStorage.removeItem(LOCAL_STORAGE_KEY);

            // redirect to home to check user's own latest location
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
        setTimeout(() => {
            window.dispatchEvent(new Event(ON_USER_DATA_READY));
        });
    }
}



export const handleDataChange = (newVal: UserDataStoreType) => {
    if ((newVal as any).ignoreAutoDebounceSave) {
        return;
    }
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
    pendingSave = true;
    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(async () => {
        await saveUserDataNow(newVal);
    }, 1000);
}

export const saveUserDataNow = async (data: UserDataStoreType) => {
    const { error } = await (await authGlobalApiClient.update_user_data.$patch({
        json: cleanEmptyProps({
            ...data.userData,
        })
    })).json();
    if (error) {
        console.error(error);
        toast.error("Failed to save user data");
    }
    pendingSave = false;
}

export const logoutAll = async () => {
    const { error } = await (await authGlobalApiClient["logout-all"].$post()).json();
    if (error) {
        console.error(error);
        toast.error("Failed to logout");
        return;
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