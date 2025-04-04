// import type { CartItem } from "@lib/types/menuType";
// import {
//     type UserLocalStorageType,
//     USER_DEFAULT_VALUE,
// } from "@lib/types/UserLocalStorageTypes";
// import {
//     ref
// } from "vue";
// import { showItemModal } from "../components/store-page/menu/item/showItemModal";

// export const userLocalStore = ref<UserLocalStorageType>({
//     ...USER_DEFAULT_VALUE,
//     carts: {}
// });


// export const getCartByStoreId = (storeId: string) => {
//     const hostAndStoreId = `${window.location.host}_-_${storeId}`;
//     if (!userLocalStore.value?.carts) {
//         userLocalStore.value!.carts = {};
//     }
//     return userLocalStore.value?.carts?.[hostAndStoreId];
// };

// export const addItemToCart = (
//     storeId: string,
//     storeName: string,
//     cartItem: CartItem
// ) => {
//     const storeCart = getCartByStoreId(storeId);
//     const hostAndStoreId = `${window.location.host}_-_${storeId}`;
//     if (!userLocalStore.value?.carts?.[hostAndStoreId]) {
//         userLocalStore.value!.carts![hostAndStoreId] = {
//             storeId,
//             storeName: storeName,
//             orderNote: "",
//             items: [cartItem]
//         }
//     } else {
//         if (storeCart?.items) {
//             storeCart.items.push(cartItem);
//         } else {
//             storeCart!.items = [cartItem];
//         }
//     }
// };

// export const openItemInCart = (storeId: string, itemIndex: number) => {
//     const storeCart = getCartByStoreId(storeId);
//     if (storeCart) {
//         const cartItem = JSON.parse(JSON.stringify(storeCart.items?.[itemIndex]))
//         if (cartItem) {
//             showItemModal(cartItem.itemId!, cartItem, itemIndex)
//         }
//     }
// }

// export const updateItemInCart = (storeId: string, itemIndex: number, cartItem: CartItem) => {
//     const storeCart = getCartByStoreId(storeId);
//     if (storeCart) {
//         storeCart.items![itemIndex] = cartItem;
//     }
// }


// export const removeItemFromCart = (storeId: string, itemIndex: number) => {
//     const storeCart = getCartByStoreId(storeId);
//     if (storeCart) {
//         storeCart.items?.splice(itemIndex, 1);
//     }
//     if (storeCart?.items?.length === 0) {
//         const hostAndStoreId = `${window.location.host}_-_${storeId}`;
//         delete userLocalStore.value?.carts?.[hostAndStoreId];
//     }
// }

// export const clearCartByStoreId = (storeId: string) => {
//     const hostAndStoreId = `${window.location.host}_-_${storeId}`;
//     delete userLocalStore.value?.carts?.[hostAndStoreId];
// }
