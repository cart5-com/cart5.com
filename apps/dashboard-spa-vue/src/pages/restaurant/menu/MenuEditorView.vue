<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
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
import type { MenuJSON } from "lib/types/menuTypes";
import { dashboardApiClient } from "@src/lib/dashboardApiClient";
import { currentRestaurantId } from "@src/stores/RestaurantStore";
import { toast } from '@/ui-plus/sonner';
import MenuTab from "./tabs/MenuTab.vue";
import { provideMenuOperations } from './composables/useMenuOperations'


pageTitle.value = 'Menu Editor'
const isLoading = ref(false);

const defaultMenuJSON: MenuJSON = {
    categoryIdsOrder: [],
    allCategories: {},
    allItems: {},
    allOptionGroups: {}
}

const menuJSON = ref<MenuJSON>(defaultMenuJSON);

let ignoreAutoSave = true;
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch([menuJSON], () => {
    if (ignoreAutoSave) return;
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
        saveMenu()
    }, 3000)
}, { deep: true, immediate: true })

const loadMenu = async () => {
    isLoading.value = true;
    try {
        const { data, error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$post({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                columns: {
                    menu: {
                        menuJson: true
                    }
                }
            }
        })).json();

        if (error) {
            toast.error('Failed to load menu');
            return;
        }

        menuJSON.value = data?.menu?.menuJson as MenuJSON || defaultMenuJSON;
    } catch (err) {
        console.error('Error loading menu:', err);
        toast.error('Failed to load menu');
    } finally {
        isLoading.value = false;
        setTimeout(() => {
            ignoreAutoSave = false;
        }, 1000)
    }
}

const saveMenu = async () => {
    isLoading.value = true;
    try {
        const { error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                menu: {
                    menuJson: menuJSON.value
                }
            }
        })).json();

        if (error) {
            toast.error('Failed to save menu');
            return;
        }
        toast.success('Menu saved successfully');
    } catch (err) {
        console.error('Error saving menu:', err);
        toast.error('Failed to save menu');
    } finally {
        isLoading.value = false;
    }
}

onMounted(() => {
    loadMenu();
});


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

provideMenuOperations({
    openItemDialog,
    openCategoryDialog
})

</script>


<template>
    <div class="p-0 sm:p-2">
        <div class="mx-auto mt-4">
            <ItemDialog ref="itemDialog"
                        :item="currentItemId ? menuJSON?.allItems?.[currentItemId] : undefined" />
            <CategoryDialog ref="categoryDialog"
                            :category="currentCategoryId ? menuJSON?.allCategories?.[currentCategoryId] : undefined" />

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
                    <MenuTab :menuJSON="menuJSON" />
                </TabsContent>
                <TabsContent value="items">
                    <div>Items</div>
                </TabsContent>
                <TabsContent value="optionGroups">
                    <div>Choices & Addons</div>
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

<style scoped>
.sortable-chosen {
    /* background-color: rgba(0, 0, 0, 0.02); */
    border: 1px dashed rgba(var(--primary));
}
</style>