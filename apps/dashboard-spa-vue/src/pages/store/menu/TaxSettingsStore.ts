import { defaultTaxSettings } from "@lib/types/taxTypes";
import { currentStoreId } from "@dashboard-spa-vue/stores/MyStoresStore";
import { apiClient } from "@api-client/index";
import { toast } from "@/ui-plus/sonner";
import { ref } from "vue";


export const taxSettings = ref<typeof defaultTaxSettings | null>(null);

export const loadTaxSettings = async () => {
    taxSettings.value = null;
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