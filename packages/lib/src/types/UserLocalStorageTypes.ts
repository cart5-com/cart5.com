
import type { CartItem } from "./menuType";

export type RestaurantId = string;

export type Cart = {
    id?: string;
    restaurantId?: RestaurantId;
    restaurantName?: string;
    items?: CartItem[];
}

export type UserLocalStorageType = {
    carts?: Cart[];
}