import type { CartItem } from "@lib/types/menuType";
import {
    type UserLocalStorageType
} from "@lib/types/UserLocalStorageTypes";
import {
    ref,
    watch
} from "vue";
import { showItemModal } from "../components/store-page/menu/item/showItemModal";
const USER_LOCAL_STORAGE_KEY = "ANON_USER_LOCAL_STORAGE_V1";
export const userCartsStore = ref<UserLocalStorageType | null>(null);

function initializeUserCartsStore() {
    const userLocalStorage = localStorage.getItem(USER_LOCAL_STORAGE_KEY);
    if (userLocalStorage) {
        userCartsStore.value = JSON.parse(userLocalStorage);
    } else {
        userCartsStore.value = {
            carts: []
        };
    }

    watch(userCartsStore, (newVal) => {
        localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(newVal));
    }, { immediate: false, deep: true });
}

if (typeof window !== "undefined") {
    // setTimeout(() => {
    initializeUserCartsStore();
    // }, 200);
}

export const getCartByStoreId = (storeId: string) => {
    return userCartsStore.value?.carts?.find((cart) => cart.storeId === storeId);
};

export const addItemToCart = (
    storeId: string,
    storeName: string,
    cartItem: CartItem
) => {
    const storeCart = getCartByStoreId(storeId);
    if (!storeCart) {
        userCartsStore.value?.carts?.push({
            id: crypto.randomUUID(),
            storeId,
            storeName: storeName,
            orderNotes: "",
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
        userCartsStore.value?.carts?.splice(userCartsStore.value?.carts?.findIndex((cart) => cart.id === storeCart.id), 1);
    }
}

export const clearCartByCartId = (cartId: string) => {
    userCartsStore.value?.carts?.splice(userCartsStore.value?.carts?.findIndex((cart) => cart.id === cartId), 1);
}

// export const clearCart = (storeId: string) => {
//     const storeCart = getCartByStoreId(storeId);
//     if (storeCart) {
//         storeCart.items = [];
//     }
//     if (storeCart?.items?.length === 0) {
//         userCartsStore.value?.carts?.splice(userCartsStore.value?.carts?.findIndex((cart) => cart.id === storeCart.id), 1);
//     }
// }
