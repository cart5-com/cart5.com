import { ref } from "vue";
import { type MenuRoot } from "@lib/types/menuType";
import { apiClient } from "@api-client/index";
import { currentStoreId } from "@dashboard-spa-vue/stores/MyStoresStore";
import { toast } from "@/ui-plus/sonner";
import { defaultTaxSettings } from "@lib/types/taxTypes";

export const defaultMenuRoot: MenuRoot = {
    children: [],
    allItems: {}
}

export const menuRoot = ref<MenuRoot>(defaultMenuRoot);
export const taxSettings = ref<typeof defaultTaxSettings | null>(null);

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
    } else {
        menuRoot.value = data?.menuRoot as MenuRoot || defaultMenuRoot;
    }
    isMenuLoading.value = false;
}

export const saveMenu = async () => {
    isMenuLoading.value = true;
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
    } else {
        toast.success('Menu saved successfully');
    }
    isMenuLoading.value = false;
}

export const loadTaxSettings = async () => {
    const { data, error } = await (await apiClient.dashboard.store[':storeId'].tax_settings.get.$post({
        param: {
            storeId: currentStoreId.value ?? '',
        },
        json: {
            columns: {
                taxCategories: true,
                currency: true,
                currencySymbol: true,
                salesTaxType: true,
                taxName: true,
                taxRateForDelivery: true,
            }
        }
    })).json();

    if (error) {
        toast.error('Failed to load tax settings');
    } else {
        if (data) {
            taxSettings.value = {
                taxCategories: data.taxCategories ?? defaultTaxSettings.taxCategories,
                currency: data.currency ?? defaultTaxSettings.currency,
                currencySymbol: data.currencySymbol ?? defaultTaxSettings.currencySymbol,
                salesTaxType: data.salesTaxType ?? defaultTaxSettings.salesTaxType,
                taxName: data.taxName ?? defaultTaxSettings.taxName,
                taxRateForDelivery: data.taxRateForDelivery ?? defaultTaxSettings.taxRateForDelivery,
            };
        }
    }
}