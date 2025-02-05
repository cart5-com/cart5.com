<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { pageTitle } from '@src/stores/layout.store'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import {
    Check,
    Loader2,
} from "lucide-vue-next";
import ItemDialog from "./components/ItemDialog.vue";
import CategoryDialog from "./components/CategoryDialog.vue";
import { Button } from "@/components/ui/button";
import MenuTab from "./tabs/MenuTab.vue";
import { provideMenuOperations } from './composables/useMenuOperations'
import ItemsTab from "./tabs/ItemsTab.vue";
import OptionGroupDialog from "./components/OptionGroupDialog.vue";
import OptionGroupsTab from "./tabs/OptionGroupsTab.vue";
import { loadMenu, saveMenu, menuJSON, isLoading } from "./store";


pageTitle.value = 'Menu Editor'


let ignoreAutoSave = true;
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const stopWatch = watch([menuJSON], () => {
    if (ignoreAutoSave) return;
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
        saveMenu()
    }, 3000)
}, { deep: true, immediate: true })


onMounted(async () => {
    ignoreAutoSave = true;
    await loadMenu();
    setTimeout(() => {
        ignoreAutoSave = false;
    }, 500)
});

onUnmounted(() => {
    ignoreAutoSave = true;
    stopWatch(); // Explicitly stop the watch
    if (debounceTimer) {
        clearTimeout(debounceTimer); // Clean up any pending timeout
    }
})

const currentItemId = ref<string | null>(null);
const itemDialog = ref<InstanceType<typeof ItemDialog>>();
function openItemDialog(itemId: string) {
    currentItemId.value = itemId
    if (itemDialog.value) {
        itemDialog.value.isOpen = true
    }
}

const currentCategoryId = ref<string | null>(null);
const categoryDialog = ref<InstanceType<typeof CategoryDialog>>();
function openCategoryDialog(categoryId: string) {
    currentCategoryId.value = categoryId
    if (categoryDialog.value) {
        categoryDialog.value.isOpen = true
    }
}

const currentOptionGroupId = ref<string | null>(null);
const optionGroupDialog = ref<InstanceType<typeof OptionGroupDialog>>();
function openOptionGroupDialog(optionGroupId: string) {
    currentOptionGroupId.value = optionGroupId
    if (optionGroupDialog.value) {
        optionGroupDialog.value.isOpen = true
    }
}


provideMenuOperations({
    openItemDialog,
    openCategoryDialog,
    openOptionGroupDialog
})

</script>


<template>
    <div class="p-0 sm:p-2">
        <div class="mx-auto mt-4">
            <ItemDialog ref="itemDialog"
                        :item="currentItemId ? menuJSON?.allItems?.[currentItemId] : undefined" />
            <CategoryDialog ref="categoryDialog"
                            :category="currentCategoryId ? menuJSON?.allCategories?.[currentCategoryId] : undefined" />

            <OptionGroupDialog ref="optionGroupDialog"
                               :optionGroup="currentOptionGroupId ? menuJSON?.allOptionGroups?.[currentOptionGroupId] : undefined" />

            <Tabs default-value="menu"
                  class="w-full">
                <TabsList class="">
                    <TabsTrigger value="menu">
                        Menu
                    </TabsTrigger>
                    <TabsTrigger value="items">
                        Items
                    </TabsTrigger>
                    <TabsTrigger value="optionGroups">
                        Choices & Addons
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="menu">
                    <MenuTab />
                </TabsContent>
                <TabsContent value="items">
                    <ItemsTab />
                </TabsContent>
                <TabsContent value="optionGroups">
                    <OptionGroupsTab />
                </TabsContent>
            </Tabs>


            <Button @click="saveMenu()"
                    variant="secondary"
                    class="mt-4"
                    :disabled="isLoading">
                <Loader2 class="w-4 h-4 animate-spin"
                         v-if="isLoading" />Auto save
                <Check />
            </Button>
        </div>
        <div class="mt-4">
            <details>
                <summary>menuJSON</summary>
                <pre class="text-xs max-h-96 overflow-y-auto">{{ menuJSON }}</pre>
            </details>
        </div>
    </div>
</template>
