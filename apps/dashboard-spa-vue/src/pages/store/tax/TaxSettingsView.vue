<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2, Loader2 } from 'lucide-vue-next';
import { toast } from '@/ui-plus/sonner';
import { dashboardApiClient } from '@api-client/dashboard';
import type { ResType } from '@api-client/typeUtils';
import { currentStoreId } from '@dashboard-spa-vue/stores/MyStoresStore';
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import CurrencyWidget from './CurrencyWidget.vue';
import { ipwhois } from '@/ui-plus/geolocation-selection-map/ipwhois';
import { getJurisdictionSalesTaxRate } from '@lib/utils/sales_tax_rates';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-vue-next'
import TaxHelperDialog from './TaxHelperDialog.vue';
import { cleanEmptyProps } from '@lib/utils/cleanEmptyProps';

pageTitle.value = 'Tax Settings';

const isLoading = ref(false);

const taxSettingsApiPath = dashboardApiClient.store[':storeId'].tax_settings.get.$post;
type TaxSettings = ResType<typeof taxSettingsApiPath>["data"];

const taxSettings = ref<TaxSettings>();

onMounted(() => {
    loadData();
});

function convert_GetSalesTaxRate_2_TaxSettings(salesTaxRate: ReturnType<typeof getJurisdictionSalesTaxRate>) {
    const taxSettings: TaxSettings = {
        storeId: currentStoreId.value ?? '',
        taxCategories: [{
            id: crypto.randomUUID(),
            name: "TAX1",
            deliveryRate: salesTaxRate.taxRate,
            pickupRate: salesTaxRate.taxRate,
        }],
        currency: salesTaxRate.raw.currency,
        currencySymbol: salesTaxRate.raw.currencySymbol ?? null,
        salesTaxType: salesTaxRate.raw.isTaxAppliesAtCheckout ? "APPLY_TAX_ON_TOP_OF_PRICES" : "ITEMS_PRICES_ALREADY_INCLUDE_TAXES",
        taxName: salesTaxRate.taxName,
        showTaxDetailsInCart: salesTaxRate.raw.isTaxAppliesAtCheckout ?? false,
        taxRateForDelivery: salesTaxRate.taxRate,
        taxRateForServiceFees: salesTaxRate.taxRate,
    }
    return taxSettings;
}

const loadData = async () => {
    isLoading.value = true;
    const { data, error } = await (await dashboardApiClient.store[':storeId'].tax_settings.get.$post({
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
                showTaxDetailsInCart: true,
                taxRateForDelivery: true,
                taxRateForServiceFees: true,
            }
        }
    })).json();

    if (error) {
        toast.error('Failed to load tax settings');
    } else {
        if (data) {
            taxSettings.value = data;
        } else {
            fillWithIpWhois();
        }

    }
    isLoading.value = false;
};

const fillWithIpWhois = async () => {
    const ipWhoisResult = await ipwhois();
    populateTaxSettingsFromLocation(ipWhoisResult.country_code ?? '', ipWhoisResult.region_code ?? '');
    toast.warning('Your tax setting were empty, filled for your location. You need to verify and save them. otherwise they will not be applied.');
}

const populateTaxSettingsFromLocation = (countryCode: string, regionCode: string) => {
    const salesTaxRate = getJurisdictionSalesTaxRate(countryCode, regionCode);
    taxSettings.value = convert_GetSalesTaxRate_2_TaxSettings(salesTaxRate);
}

const saveTaxSettings = async () => {
    isLoading.value = true;
    try {
        const { error } = await (await dashboardApiClient.store[':storeId'].tax_settings.update.$patch({
            param: {
                storeId: currentStoreId.value ?? '',
            },
            json: cleanEmptyProps({
                currency: taxSettings.value?.currency,
                currencySymbol: taxSettings.value?.currencySymbol,
                salesTaxType: taxSettings.value?.salesTaxType,
                taxName: taxSettings.value?.taxName,
                showTaxDetailsInCart: taxSettings.value?.showTaxDetailsInCart,
                taxRateForDelivery: taxSettings.value?.taxRateForDelivery,
                taxRateForServiceFees: taxSettings.value?.taxRateForServiceFees,
                taxCategories: taxSettings.value?.taxCategories ?? []
            })
        })).json();

        if (error) {
            toast.error('Failed to save tax settings');
            return;
        }
        toast.success('Tax settings saved successfully');
    } catch (err) {
        console.error('Error saving tax settings:', err);
        toast.error('Failed to save tax settings');
    } finally {
        isLoading.value = false;
    }
};

const addTaxCategory = () => {
    if (
        taxSettings.value &&
        taxSettings.value.taxCategories
    ) {
        taxSettings.value.taxCategories.push({
            id: crypto.randomUUID(),
            name: 'TAX' + (taxSettings.value.taxCategories.length + 1),
            deliveryRate: 0,
            pickupRate: 0,
        });
    }
};

const removeTaxCategory = (index: number) => {
    if (
        taxSettings.value &&
        taxSettings.value.taxCategories
    ) {
        taxSettings.value.taxCategories.splice(index, 1);
    }
};

</script>

<template>
    <div class="max-w-md mx-auto space-y-6"
         v-if="taxSettings">
        <Card>
            <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
                <CardDescription>Configure your store's tax settings</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <Alert variant="destructive"
                       class="my-4">
                    <AlertCircle class="w-4 h-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                        You are responsible for verifying the accuracy of all currency and tax information for your
                        specific jurisdiction. While we provide this information as a convenience, we do not accept any
                        responsibility regarding the accuracy of currency and tax information, nor for the proper
                        collection or
                        remittance of such taxes in connection with our products and services. All currency and
                        tax-related information
                        filled by this website is intended solely as a convenience.
                    </AlertDescription>
                </Alert>

                <div class="space-y-2">
                    <div class="flex justify-between items-center">
                        <Label>Currency</Label>
                        <TaxHelperDialog @tax-location-selected="populateTaxSettingsFromLocation" />
                    </div>
                    <CurrencyWidget v-model="taxSettings.currency!" />
                </div>

                <!-- Tax Type Selection -->
                <div class="space-y-2">
                    <Label>Tax Type</Label>
                    <Select v-model="taxSettings.salesTaxType!">
                        <SelectTrigger>
                            <SelectValue :placeholder="taxSettings.salesTaxType!" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ITEMS_PRICES_ALREADY_INCLUDE_TAXES">
                                Menu Prices Include Taxes
                            </SelectItem>
                            <SelectItem value="APPLY_TAX_ON_TOP_OF_PRICES">
                                Apply Tax on Top of Prices
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <!-- Basic Tax Settings -->
                <!-- <div class="grid gap-4 sm:grid-cols-2">
                </div> -->

                <div class="space-y-2">
                    <Label>Tax Name</Label>
                    <Input v-model="taxSettings.taxName!"
                           placeholder="e.g., VAT, GST, HST" />
                </div>

                <div class="space-y-2">

                    <div class="items-top flex space-x-2">
                        <Checkbox id="showTaxDetailsInCart"
                                  v-model:checked="taxSettings.showTaxDetailsInCart" />
                        <label for="showTaxDetailsInCart"
                               class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Show Tax Details in Cart
                        </label>
                    </div>
                </div>

                <div class="space-y-2">
                    <Label>Currency Symbol</Label>
                    <Input v-model="taxSettings.currencySymbol!"
                           placeholder="e.g., £, $" />
                </div>

                <!-- Tax Categories -->
                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <Label>Tax Categories</Label>
                        <Button variant="outline"
                                size="sm"
                                @click="addTaxCategory">
                            <PlusCircle class="w-4 h-4 mr-2" />
                            Add Category
                        </Button>
                    </div>

                    <div v-for="(category, index) in taxSettings.taxCategories"
                         :key="category.id"
                         class="border p-4 rounded-lg space-y-4">
                        <div class="flex justify-between items-center">
                            <Input v-model="category.name"
                                   placeholder="Category Name" />
                            <Button variant="ghost"
                                    size="sm"
                                    @click="removeTaxCategory(index)">
                                <Trash2 class="w-4 h-4" />
                            </Button>
                        </div>

                        <div class="grid gap-4">
                            <div class="space-y-2">
                                <Label>Delivery Rate (%)</Label>
                                <Input v-model="category.deliveryRate"
                                       type="number"
                                       step="1" />
                            </div>
                            <div class="space-y-2">
                                <Label>Pickup Rate (%)</Label>
                                <Input v-model="category.pickupRate"
                                       type="number"
                                       step="1" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-2">
                    <Label>Tax Rate for Delivery fees(%)</Label>
                    <Input v-model="taxSettings.taxRateForDelivery!"
                           type="number"
                           step="1" />
                </div>

                <div class="space-y-2">
                    <Label>Tax Rate for Service Fees(%)</Label>
                    <Input v-model="taxSettings.taxRateForServiceFees!"
                           type="number"
                           step="1" />
                    <!-- <p class="text-xs text-muted-foreground">
                        This tax rate will be used to calculate the tax on platform service fee, support partner service
                        fees and marketing partner service fees.
                        <br />
                        <br />
                        <span class="font-bold">
                            Note:
                        </span>
                        apply the tax rate that you pay to other businesses in your jurisdiction.
                    </p> -->
                </div>

                <Button @click="saveTaxSettings"
                        :disabled="isLoading"
                        class="w-full">
                    <Loader2 v-if="isLoading"
                             class="animate-spin mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </CardContent>
        </Card>
    </div>
</template>