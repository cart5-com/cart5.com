import type { CartItem } from "@lib/types/menuType";
import {
    type UserLocalStorageType,
    USER_DEFAULT_VALUE,
    USER_LOCAL_STORAGE_KEY
} from "@lib/types/UserLocalStorageTypes";
import {
    ref,
    watch
} from "vue";
import { showItemModal } from "../components/store-page/menu/item/showItemModal";


export const userLocalStore = ref<UserLocalStorageType | null>(null);

export function initializeUserStore() {
    if (typeof window === "undefined") {
        return;
    }
    if (userLocalStore.value !== null) {
        return userLocalStore;
    }
    const userLocalStorage = localStorage.getItem(USER_LOCAL_STORAGE_KEY);
    if (userLocalStorage) {
        userLocalStore.value = JSON.parse(userLocalStorage);
    } else {
        userLocalStore.value = USER_DEFAULT_VALUE;
        localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(userLocalStore.value));
    }
    watch(userLocalStore, (newVal) => {
        localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(newVal));
    }, { immediate: false, deep: true });
    return userLocalStore;
}

// if (typeof window !== "undefined") {
//     initializeUserStore();
// }

export const getCartByStoreId = (storeId: string) => {
    return userLocalStore.value?.carts?.find((cart) => cart.storeId === storeId);
};

export const addItemToCart = (
    storeId: string,
    storeName: string,
    cartItem: CartItem
) => {
    const storeCart = getCartByStoreId(storeId);
    if (!storeCart) {
        userLocalStore.value?.carts?.push({
            id: crypto.randomUUID(),
            storeId,
            storeName: storeName,
            orderNote: "",
            items: [cartItem]
        })
    } else {
        if (storeCart.items) {
            storeCart.items.push(cartItem);
        } else {
            storeCart.items = [cartItem];
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
        storeCart.items![itemIndex] = cartItem;
    }
}


export const removeItemFromCart = (storeId: string, itemIndex: number) => {
    const storeCart = getCartByStoreId(storeId);
    if (storeCart) {
        storeCart.items?.splice(itemIndex, 1);
    }
    if (storeCart?.items?.length === 0) {
        userLocalStore.value?.carts?.splice(userLocalStore.value?.carts?.findIndex((cart) => cart.id === storeCart.id), 1);
    }
}

export const clearCartByCartId = (cartId: string) => {
    userLocalStore.value?.carts?.splice(userLocalStore.value?.carts?.findIndex((cart) => cart.id === cartId), 1);
}
