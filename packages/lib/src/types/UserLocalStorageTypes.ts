
import type { CartItem } from "./menuType";

export type StoreId = string;

export type Cart = {
    id?: string;
    storeId?: StoreId;
    storeName?: string;
    orderNote?: string;
    items?: CartItem[];
}

export type UserLocalStorageType = {

    version: string;

    address?: string;
    country?: string;
    latitude?: number;
    longitude?: number;

    lastOrderType?: "delivery" | "pickup";

    carts?: Cart[];
}

export const USER_LOCAL_STORAGE_KEY = "USER_LOCAL_STORAGE_V1";
export const USER_DEFAULT_VALUE: UserLocalStorageType = {
    version: "1",
    carts: []
};