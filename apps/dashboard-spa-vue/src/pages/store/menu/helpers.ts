import { Item, type CartItem, type ItemId } from '@lib/types/menuType';
import ItemPreviewEditable from './editable/ItemPreviewEditable.vue';
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import { menuRoot } from './MenuRootStore';
const dialog = useDialog();

export function previewItem(itemId: ItemId) {
    dialog.show<CartItem>({
        // title: menuRoot.value.allItems?.[itemId]?.itemLabel,
        title: 'Edit Item',
        component: ItemPreviewEditable,
        dialogContentClass: "min-w-full md:min-w-[60vw] lg:min-w-[40vw] top-12 absolute",
        // dialogContentClass: "flex h-full min-h-full min-w-full flex-col p-0 md:h-[70vh] md:min-h-[70vh] md:min-w-[60vw] lg:min-w-[40vw]",
        props: {
            itemId: itemId
        },
        onSuccess: async (values) => {
            console.log("success");
            console.log(JSON.stringify(values, null, 2));
        },
    });
}

export function createNewItem(
    type: Item['t'] = 'i',
    optionalProps: Partial<Item> = {},
    parentItemId: string | undefined
) {
    if (!menuRoot.value?.allItems) {
        menuRoot.value.allItems = {}
    }
    optionalProps.t = type;
    const typeCount = Object.values(menuRoot.value.allItems).filter(item => item.t === type).length;
    const newItem: Item = {
        // id: `${type}-${crypto.randomUUID()}`,
        id: `${type}-${typeCount + 1}`,
        ...optionalProps
    }

    menuRoot.value.allItems[newItem.id!] = newItem;
    return addChildItem(parentItemId, newItem.id!);
}

export function addChildItem(parentItemId: string | undefined, itemId: string) {
    if (!parentItemId) {
        return itemId;
    }
    if (!menuRoot.value?.allItems) {
        menuRoot.value.allItems = {}
    }
    if (
        menuRoot.value.allItems[parentItemId] &&
        !menuRoot.value.allItems[parentItemId]?.cIds
    ) {
        menuRoot.value.allItems[parentItemId].cIds = []
    }
    menuRoot.value?.allItems?.[parentItemId]?.cIds?.push(itemId)
    return itemId;
}