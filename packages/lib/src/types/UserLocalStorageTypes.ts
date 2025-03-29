
import type { CartItem } from "./menuType";

export type StoreId = string;

export type Cart = {
    id?: string;
    storeId?: StoreId;
    storeName?: string;
    orderNotes?: string;
    items?: CartItem[];
}

export type UserLocalStorageType = {
    carts?: Cart[];
}