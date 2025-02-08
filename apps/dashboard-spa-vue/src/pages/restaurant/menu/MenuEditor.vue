<script lang="ts" setup>
import { type Ref } from 'vue'
import { menuRoot } from "./store";
import { useVModel } from '@vueuse/core'
import { BucketItem, type ItemId, type MenuRoot } from 'lib/types/menuType2';
import ItemPreviewDialog from './preview/ItemPreviewDialog.vue';
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import { Button } from '@/components/ui/button';
import SelectWithSearch from '@/ui-plus/SelectWithSearch.vue';
import { Eye, Plus } from 'lucide-vue-next';
import { CommandItem } from '@/components/ui/command';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card'
import { provideMenuOperations } from './composables/useMenuOperations'
provideMenuOperations({
    previewItem
})



const dialog = useDialog();

const props = defineProps<{
    modelValue?: MenuRoot;
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: MenuRoot): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: menuRoot.value,
    deep: props.modelValue ? false : true,
}) as Ref<typeof props.modelValue>;

function previewItem(itemId: ItemId) {
    dialog.show<BucketItem>({
        // title: menu2Store.value.allItems?.[itemId]?.itemLabel,
        component: ItemPreviewDialog,
        dialogContentClass: "flex h-full min-h-full min-w-full flex-col p-0 md:h-[70vh] md:min-h-[70vh] md:min-w-[60vw] lg:min-w-[40vw]",
        props: {
            itemId: itemId
        },
        onCancel: async () => {
            console.log("cancel");
        },
        onSuccess: async (values) => {
            console.log("success");
            console.log(JSON.stringify(values, null, 2));
        },
        onError: async (error: any) => {
            console.log("error");
            console.log(error);
        }
    });
}


</script>

<template>
    <div>
        <div v-for="item in modelValue?.children"
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
        </div>
        <Button variant="outline"
                @click="() => {
                    // addNewCategory()
                }">
            <Plus /> Add new category
        </Button>

        <SelectWithSearch :items="Object.values(modelValue?.allItems ?? {}).filter(item => (item.children?.length ?? 0) > 0).map(item => ({ key: item.itemId, name: item.itemLabel }))"
                          @select="(item) => { console.log(item) }"
                          @create-new="(search) => { console.log('search', search) }"
                          :has-new-button="true">
            <!-- <template #new-button="{ search }">
                <Button variant="outline"
                        class="w-full"
                        @click="() => { console.log('search', search) }">
                    New category
                </Button>
            </template> -->
            <template #items-list="{ items, emit }">
                <CommandItem v-for="item in items"
                             :key="item.key"
                             :value="item.name + ' ' + item.key"
                             @select="emit('select', item)">
                    <div class="flex justify-between w-full">
                        <div>
                            {{ item.name }}
                        </div>
                        <div>
                            <HoverCard>
                                <HoverCardTrigger>
                                    <Eye />
                                </HoverCardTrigger>
                                <HoverCardContent class="w-80">
                                    <ItemPreviewDialog :item-id="item.key" />
                                </HoverCardContent>
                            </HoverCard>
                        </div>
                    </div>
                </CommandItem>




            </template>

            <template #trigger>
                <Button variant="outline">
                    <Plus /> Add new category
                </Button>
            </template>
        </SelectWithSearch>

    </div>
</template>