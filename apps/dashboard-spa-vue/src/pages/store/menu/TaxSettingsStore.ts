// import { defaultTaxSettings } from "@lib/types/taxTypes";
import { currentStoreId } from "@dashboard-spa-vue/stores/MyStoresStore";
import { apiClient, type ResType } from "@api-client/index";
import { toast } from "@/ui-plus/sonner";
import { ref } from "vue";


const taxSettingsApiPath = apiClient.dashboard.store[':storeId'].tax_settings.get.$post;
type TaxSettings = ResType<typeof taxSettingsApiPath>["data"];
export type taxCategory = NonNullable<NonNullable<TaxSettings>["taxCategories"]>[number];

export const taxSettings = ref<TaxSettings>();

export const loadTaxSettings = async () => {
    taxSettings.value = undefined;
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
            taxSettings.value = data;
        }
    }
}