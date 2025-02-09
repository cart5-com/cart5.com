import { Item, type BucketItem, type ItemId } from 'lib/types/menuType';
import ItemPreview from './preview/ItemPreview.vue';
import ItemEdit from './components/item/ItemEdit.vue';
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import { menuRoot } from './store';
import OptionSetEdit from './components/option-set/OptionSetEdit.vue';
const dialog = useDialog();


export function previewItem(itemId: ItemId) {
    dialog.show<BucketItem>({
        // title: menu2Store.value.allItems?.[itemId]?.itemLabel,
        component: ItemPreview,
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

export function editOptionSet(itemId: ItemId) {
    dialog.show<BucketItem>({
        title: "Edit Option Set",
        component: OptionSetEdit,
        dialogContentClass: "min-w-full md:min-w-[60vw] lg:min-w-[40vw]",
        props: {
            itemId: itemId
        },
    });
}

export function editItem(itemId: ItemId) {
    dialog.show<BucketItem>({
        title: "Edit Item",
        component: ItemEdit,
        dialogContentClass: "min-w-full md:min-w-[60vw] lg:min-w-[40vw]",
        props: {
            itemId: itemId
        },
        // onSuccess: async (values) => {
        //     console.log("success");
        //     console.log(JSON.stringify(values, null, 2));
        // },
    });
}

export async function createNewItem(
    search: string,
    parentItemId: string | undefined,
    namePrefix: string = "New item",
    optionalProps: Partial<Item> = {}
) {
    const newItem = {
        itemId: `item-${Date.now()}`,
        itemLabel: search ? search : `${namePrefix} ${Object.keys(menuRoot.value?.allItems ?? {}).length + 1}`,
        ...optionalProps
    }
    if (!menuRoot.value?.allItems) {
        menuRoot.value.allItems = {}
    }
    menuRoot.value.allItems[newItem.itemId] = newItem
    return addChildItem(parentItemId, newItem.itemId);
}

export async function addChildItem(parentItemId: string | undefined, itemId: string) {
    if (parentItemId) {
        if (
            menuRoot.value.allItems &&
            menuRoot.value.allItems[parentItemId] &&
            !menuRoot.value.allItems[parentItemId]?.children
        ) {
            menuRoot.value.allItems[parentItemId].children = []
        }
        menuRoot.value?.allItems?.[parentItemId]?.children?.push(itemId)
    }
    return itemId;
}