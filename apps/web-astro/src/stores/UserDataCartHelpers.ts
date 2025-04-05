import { userDataStore } from "@web-astro/stores/UserData.store";
import { type CartItem } from "@lib/zod/cartItemState";
import { showItemModal } from "../components/store-page/menu/item/showItemModal";

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