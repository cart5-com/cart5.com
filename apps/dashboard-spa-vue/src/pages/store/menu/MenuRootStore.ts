import { ref } from "vue";
import { type MenuRoot } from "@lib/zod/menuRootSchema";
import { menuCleanEmptyProperties } from "@lib/utils/menuCleanEmptyProperties";
import { dashboardApiClient } from "@api-client/dashboard";
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
    const { data, error } = await (await dashboardApiClient.store[':storeId'].menu.get.$post({
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
    } else {
        menuRoot.value = data?.menuRoot as MenuRoot || defaultMenuRoot;
    }
    isMenuLoading.value = false;
}

export const saveMenu = async () => {
    isMenuLoading.value = true;
    const { error } = await (await dashboardApiClient.store[':storeId'].menu.update.$patch({
        param: {
            storeId: currentStoreId.value ?? '',
        },
        json: {
            menuRoot: menuCleanEmptyProperties(menuRoot.value)
        }
    })).json();
    if (error) {
        toast.error('Failed to save menu');
    } else {
        toast.success('Menu saved successfully');
    }
    isMenuLoading.value = false;
}