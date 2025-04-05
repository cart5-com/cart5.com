
import { type CartItem } from "@lib/zod/cartItemState";

// TODO: remove whole ts file I don't use these types

export type HostAndStoreId = string; // as `host_-_storeId`

export type Cart = {
    storeId?: string;
    host?: string;
    lastUpdatedTS?: number;
    storeName?: string;
    orderNote?: string;
    items?: CartItem[];
}

export type UserLocalStorageType = {

    version: string;

    address?: string;
    country?: string;
    lat?: number;
    lng?: number;

    carts?: Record<HostAndStoreId, Cart>;
}

export const USER_LOCAL_STORAGE_KEY = "USER_LOCAL_STORAGE_V1";

export const USER_DEFAULT_VALUE: UserLocalStorageType = {
    version: "1",
    carts: {}
};