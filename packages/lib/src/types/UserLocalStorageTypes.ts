
import type { CartItem } from "./menuType";

export type RestaurantId = string;

export type Cart = {
    id?: string;
    restaurantId?: RestaurantId;
    restaurantName?: string;
    orderNotes?: string;
    items?: CartItem[];
}

export type UserLocalStorageType = {
    carts?: Cart[];
}