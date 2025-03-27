import { type CartItem, type ItemId, type MenuRoot } from '@lib/types/menuType';
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import ItemModal from './item/ItemModal.vue';
const dialog = useDialog();

export function showItemModal(itemId: ItemId, menuRoot: MenuRoot) {
    const currentItem = menuRoot.allItems?.[itemId];
    dialog.show<CartItem>({
        // title: menuRoot.value.allItems?.[itemId]?.itemLabel,
        title: currentItem?.lbl,
        component: ItemModal,
        dialogContentClass: "min-w-full md:min-w-[60vw] lg:min-w-[40vw] top-12 absolute",
        // dialogContentClass: "flex h-full min-h-full min-w-full flex-col p-0 md:h-[70vh] md:min-h-[70vh] md:min-w-[60vw] lg:min-w-[40vw]",
        props: {
            itemId: itemId,
            menuRoot: menuRoot
        },
        onSuccess: async (values) => {
            console.log("success");
            console.log(JSON.stringify(values, null, 2));
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