import type { CartItem } from "@lib/types/menuType";
import {
    type UserLocalStorageType
} from "@lib/types/UserLocalStorageTypes";
import {
    ref,
    watch
} from "vue";
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

export const getCartByRestaurantId = (restaurantId: string) => {
    return userCartsStore.value?.carts?.find((cart) => cart.restaurantId === restaurantId);
};

export const addItemToCart = (
    restaurantId: string,
    restaurantName: string,
    cartItem: CartItem
) => {
    const restaurantCart = getCartByRestaurantId(restaurantId);
    if (!restaurantCart) {
        userCartsStore.value?.carts?.push({
            id: crypto.randomUUID(),
            restaurantId,
            restaurantName: restaurantName,
            items: [cartItem]
        })
    } else {
        if (restaurantCart.items) {
            restaurantCart.items.push(cartItem);
        } else {
            restaurantCart.items = [cartItem];
        }
    }
};
