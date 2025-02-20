import { Item, type BucketItem, type ItemId } from 'lib/types/menuType';
// import ItemPreview from './preview/ItemPreview.vue';
import ItemPreviewEditable from './editable/ItemPreviewEditable.vue';
import ItemEdit from './components/ItemEdit.vue';
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import { menuRoot } from './store';
import CustomizationEdit from './components/CustomizationEdit.vue';
const dialog = useDialog();

// TODO: remove unused componenets inside /components /preview folders


export function previewItem(itemId: ItemId) {
    dialog.show<BucketItem>({
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

export function editCustomization(itemId: ItemId) {
    dialog.show<BucketItem>({
        title: "Edit Customization",
        component: CustomizationEdit,
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

export function createNewItem(
    type: Item['t'] = 'i',
    optionalProps: Partial<Item> = {},
    parentItemId: string | undefined
) {
    optionalProps.t = type;
    const newItem = {
        itemId: `${type}-${crypto.randomUUID()}`,
        ...optionalProps
    }
    if (!menuRoot.value?.allItems) {
        menuRoot.value.allItems = {}
    }
    menuRoot.value.allItems[newItem.itemId] = newItem;
    return addChildItem(parentItemId, newItem.itemId);
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