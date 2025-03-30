import { ref } from "vue";
import { type MenuRoot } from "@lib/types/menuType";
import { apiClient } from "@api-client/index";
import { currentStoreId } from "@dashboard-spa-vue/stores/MyStoresStore";
import { toast } from "@/ui-plus/sonner";

export const defaultMenuRoot: MenuRoot = {
    children: [],
    allItems: {}
}

export const menuRoot = ref<MenuRoot>(defaultMenuRoot);

export const isMenuLoading = ref(false);

export const loadMenu = async () => {
    isMenuLoading.value = true;
    const { data, error } = await (await apiClient.dashboard.store[':storeId'].menu.get.$post({
        param: {
            storeId: currentStoreId.value ?? '',
        },
        json: {
            columns: {
                menuRoot: true
            }
        }
    })).json();

    if (error) {
        toast.error('Failed to load menu');
        return;
    } else {
        menuRoot.value = data?.menuRoot as MenuRoot || defaultMenuRoot;
    }
    isMenuLoading.value = false;
}

export const saveMenu = async () => {
    isMenuLoading.value = true;
    try {
        const { error } = await (await apiClient.dashboard.store[':storeId'].menu.update.$patch({
            param: {
                storeId: currentStoreId.value ?? '',
            },
            json: {
                menuRoot: menuRoot.value
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
        isMenuLoading.value = false;
    }
}