import { apiClient } from "@api-client/index";
import { ref, watch } from "vue";
import type { ResType } from "@api-client/index";
import { toast } from "@/ui-plus/sonner";
import { deepMerge } from "@lib/utils/deepMerge";
import { ipwhois } from "@/ui-plus/geolocation-selection-map/ipwhois";
import { BASE_LINKS } from "@web-astro/utils/links";
import { type CartItem } from "@lib/zod/cartItemState";
import { showItemModal } from "../components/store-page/menu/item/showItemModal";

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
                carts: true,
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





/////////////CART ACTIONS/////////////
export const genCartId = (storeId: string) => {
    return `${window.location.host}_-_${storeId}`;
}
export const getCartByStoreId = (storeId: string) => {
    const hostAndStoreId = genCartId(storeId);
    if (!userDataStore.value?.userData?.carts) {
        userDataStore.value!.userData!.carts = {};
    }
    return userDataStore.value?.userData?.carts?.[hostAndStoreId];
};

export const addItemToCart = (
    storeId: string,
    storeName: string,
    cartItem: CartItem
) => {
    const storeCart = getCartByStoreId(storeId);
    const hostAndStoreId = genCartId(storeId);
    if (!userDataStore.value?.userData?.carts?.[hostAndStoreId]) {
        userDataStore.value!.userData!.carts![hostAndStoreId] = {
            storeId,
            storeName: storeName,
            orderNote: "",
            lastUpdatedTS: Date.now(),
            items: [cartItem]
        }
    } else {
        if (storeCart?.items) {
            storeCart.lastUpdatedTS = Date.now();
            storeCart.items.push(cartItem);
        } else {
            storeCart!.lastUpdatedTS = Date.now();
            storeCart!.items = [cartItem];
        }
    }
};

export const openItemInCart = (storeId: string, itemIndex: number) => {
    const storeCart = getCartByStoreId(storeId);
    if (storeCart) {
        const cartItem = JSON.parse(JSON.stringify(storeCart.items?.[itemIndex]))
        if (cartItem) {
            showItemModal(cartItem.itemId!, cartItem, itemIndex)
        }
    }
}

export const updateItemInCart = (storeId: string, itemIndex: number, cartItem: CartItem) => {
    const storeCart = getCartByStoreId(storeId);
    if (storeCart) {
        storeCart.lastUpdatedTS = Date.now();
        storeCart.items![itemIndex] = cartItem;
    }
}

export const removeItemFromCart = (storeId: string, itemIndex: number) => {
    const storeCart = getCartByStoreId(storeId);
    if (storeCart) {
        storeCart.lastUpdatedTS = Date.now();
        storeCart.items?.splice(itemIndex, 1);
    }
    if (storeCart?.items?.length === 0) {
        const hostAndStoreId = genCartId(storeId);
        delete userDataStore.value?.userData?.carts?.[hostAndStoreId];
    }
}

export const clearCartByStoreId = (storeId: string) => {
    const hostAndStoreId = genCartId(storeId);
    delete userDataStore.value?.userData?.carts?.[hostAndStoreId];
}
///////////CART ACTIONS/////////////


loadUserData();