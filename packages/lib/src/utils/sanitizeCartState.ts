import type {
    CartItem,
    // CartChildrenItemState
} from "@lib/zod/cartItemState";
import type { MenuRoot } from "@lib/zod/menuRootSchema";

export const sanitizeCartState = (
    cartItem: CartItem,
    menuRoot: MenuRoot
): CartItem => {
    // TODO: make sure all state checked with the menudata limits and maxs
    console.log('sanitizeCartState', cartItem, menuRoot);
    let cartItemState = cartItem;
    return cartItemState;
};
