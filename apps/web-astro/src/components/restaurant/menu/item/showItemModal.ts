import { type CartItem, type ItemId } from '@lib/types/menuType';
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import ItemModal from './ItemModal.vue';
const dialog = useDialog();

export function showItemModal(itemId: ItemId, cartItem?: CartItem, index?: number) {
    dialog.show<CartItem>({
        title: window.menuRoot.allItems?.[itemId]?.lbl ?? "",
        component: ItemModal,
        dialogContentClass: "min-w-full md:min-w-[60vw] lg:min-w-[40vw] top-12 absolute",
        // dialogContentClass: "flex h-full min-h-full min-w-full flex-col p-0 md:h-[70vh] md:min-h-[70vh] md:min-w-[60vw] lg:min-w-[40vw]",
        props: {
            itemId: itemId,
            cartItem: cartItem
        },
        onSuccess: async (values) => {
            console.log("success");
            console.log(JSON.stringify(values, null, 2));
            if (cartItem && index) {
                // updateCartItem(index, values);
            } else {
                // addToCart(values);
            }
        },
        onCancel: () => {
            console.log("cancel");
        },
        onError: (error) => {
            console.log("error");
            console.log(error);
        }
    });
}