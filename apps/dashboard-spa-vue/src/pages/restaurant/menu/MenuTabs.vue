<script lang="ts" setup>
import { BucketItem, type ItemId } from 'lib/types/menuType2';
import ItemPreview from './preview/ItemPreview.vue';
import ItemEdit from './components/item/ItemEdit.vue';
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { provideMenuOperations } from './composables/useMenuOperations'
import MenuTab from './tabs/MenuTab.vue';

provideMenuOperations({
    previewItem,
    editItem
})

const dialog = useDialog();

function previewItem(itemId: ItemId) {
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

function editItem(itemId: ItemId) {
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

</script>

<template>
    <div>
        <Tabs default-value="menu"
              class="w-full">
            <TabsList class="mb-8">
                <TabsTrigger value="menu">
                    Menu Editor
                </TabsTrigger>
                <TabsTrigger value="allItems">
                    All Items
                </TabsTrigger>
            </TabsList>
            <slot name="top-btns" />
            <TabsContent value="menu">
                <MenuTab />
            </TabsContent>
            <TabsContent value="allItems">
                <h1>AllItemsTab</h1>
            </TabsContent>
        </Tabs>
        <!-- <div v-for="item in modelValue?.children"
             :key="item"
             class="border rounded-md p-4 mb-4">
            <h3>{{ modelValue?.allItems?.[item]?.itemLabel }}</h3>
            <div v-for="itemId in modelValue?.allItems?.[item]?.children"
                 :key="itemId"
                 class="border rounded-md p-4 cursor-pointer mb-4 bg-card hover:bg-accent"
                 @click="() => {
                    previewItem(itemId)
                }">
                <h4>{{ modelValue?.allItems?.[itemId]?.itemLabel }}</h4>
                <span class="text-sm"
                      v-if="modelValue?.allItems?.[itemId]?.price">${{ modelValue?.allItems?.[itemId]?.price }}</span>
            </div>
        </div> -->
    </div>
</template>