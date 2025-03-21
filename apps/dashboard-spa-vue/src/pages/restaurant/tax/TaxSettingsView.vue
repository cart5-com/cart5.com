<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2, Loader2 } from 'lucide-vue-next';
import { toast } from '@/ui-plus/sonner';
import { apiClient } from '@api-client/index';
import { currentRestaurantId } from '@dashboard-spa-vue/stores/RestaurantStore';
import type { TaxCategory } from '@lib/types/restaurantTypes';
import { pageTitle } from '@dashboard-spa-vue/stores/layout.store';
import CurrencyWidget from './CurrencyWidget.vue';
import { ipwhois } from '@/ui-plus/geolocation-selection-map/ipwhois';
import { getSalesTaxRate } from '@lib/utils/sales_tax_rates';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-vue-next'

pageTitle.value = 'Tax Settings';

// TODO: we may pre-populate the tax categories with some default ones from the address.
const isLoading = ref(false);
const getDefaultTaxCategory = (): TaxCategory => {
    return {
        id: crypto.randomUUID(),
        name: 'Food',
        deliveryRate: undefined,
        pickupRate: undefined,
    }
}
const defaultTaxSettings: {
    currency?: string;
    salesTaxType?: 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES' | 'APPLY_TAX_ON_TOP_OF_PRICES';
    currencySymbol?: string;
    taxName?: string;
    taxRateForDelivery?: number;
    taxCategories?: TaxCategory[];
} = {
    currency: 'GBP',
    salesTaxType: 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES' as 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES' | 'APPLY_TAX_ON_TOP_OF_PRICES',
    currencySymbol: '£',
    taxName: 'VAT',
    taxRateForDelivery: undefined,
    taxCategories: [
        getDefaultTaxCategory()
    ]
}
const taxSettings = ref<typeof defaultTaxSettings>(JSON.parse(JSON.stringify(defaultTaxSettings)));

const selectedCurrency = ref('');
const countryCodeHelper = ref('');

onMounted(() => {
    loadData();
    // fetchCountryCode().then(countryCode => {
    //     salesTaxInfoWidget.value?.setCountry(countryCode ?? 'GB');
    //     countryCodeHelper.value = countryCode ?? 'GB';
    //     selectedCurrency.value = currencies[countryCode ?? 'GB']?.currency ?? 'GBP';
    // });
});

const loadData = async () => {
    isLoading.value = true;
    try {
        const { data, error } = await (await apiClient.dashboard.restaurant[':restaurantId'].tax_settings.get.$post({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
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
            return;
        }

        if (data) {
            taxSettings.value = {
                taxCategories: data.taxCategories ?? defaultTaxSettings.taxCategories,
                currency: data.currency ?? defaultTaxSettings.currency,
                currencySymbol: data.currencySymbol ?? defaultTaxSettings.currencySymbol,
                salesTaxType: data.salesTaxType ?? defaultTaxSettings.salesTaxType,
                taxName: data.taxName ?? defaultTaxSettings.taxName,
                taxRateForDelivery: data.taxRateForDelivery ?? defaultTaxSettings.taxRateForDelivery,
            };
            selectedCurrency.value = data.currency ?? 'GBP';
        } else {
            saveWithIpWhois();
        }
    } catch (err) {
        console.error('Error loading tax settings:', err);
        toast.error('Failed to load tax settings');
    } finally {
        isLoading.value = false;
    }
};

const saveWithIpWhois = async () => {
    console.log('saveWithIpWhois');
    const ipWhoisResult = await ipwhois();
    const salesTaxRate = getSalesTaxRate(
        ipWhoisResult.country_code ?? '',
        ipWhoisResult.region_code ?? ''
    );
    selectedCurrency.value = salesTaxRate?.currency;
    taxSettings.value.currencySymbol = salesTaxRate?.currencySymbol;
    taxSettings.value.currency = salesTaxRate?.currency;
    taxSettings.value.taxName = salesTaxRate?.type.toUpperCase();
    taxSettings.value.taxRateForDelivery = salesTaxRate?.rate * 100;
    if (salesTaxRate?.currentState) {
        taxSettings.value.taxRateForDelivery += salesTaxRate?.currentState?.rate * 100;
        taxSettings.value.taxName += `-` + salesTaxRate?.currentState?.type.toUpperCase();
    }
    taxSettings.value.taxCategories?.forEach(category => {
        category.deliveryRate = taxSettings.value.taxRateForDelivery;
        category.pickupRate = taxSettings.value.taxRateForDelivery;
    });
    saveTaxSettings();
}

const saveTaxSettings = async () => {
    isLoading.value = true;
    try {
        const { error } = await (await apiClient.dashboard.restaurant[':restaurantId'].tax_settings.update.$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                currency: selectedCurrency.value,
                currencySymbol: taxSettings.value.currencySymbol,
                salesTaxType: taxSettings.value.salesTaxType,
                taxName: taxSettings.value.taxName,
                taxRateForDelivery: taxSettings.value.taxRateForDelivery,
                taxCategories: taxSettings.value.taxCategories
            }
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
    if (!taxSettings.value.taxCategories) {
        taxSettings.value.taxCategories = [];
    }
    taxSettings.value.taxCategories.push({
        id: crypto.randomUUID(),
        name: 'Cat ' + (taxSettings.value.taxCategories.length + 1),
        deliveryRate: 0,
        pickupRate: 0,
    });
};

const removeTaxCategory = (index: number) => {
    if (taxSettings.value.taxCategories) {
        taxSettings.value.taxCategories.splice(index, 1);
    }
};

</script>

<template>
    <div class="max-w-md mx-auto space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
                <CardDescription>Configure your restaurant's tax settings</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <Alert variant="destructive"
                       class="my-4">
                    <AlertCircle class="w-4 h-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                        You are responsible for verifying the accuracy of all currency and tax information for your
                        specific
                        jurisdiction. While we provide these information as a convenience, we do not accept any
                        responsibility
                        regarding the accuracy of currency and tax information, nor for the proper collection or
                        remittance of
                        such taxes in connection with our products and services. All currency and tax-related
                        information
                        displayed here is intended solely for demonstration purposes.
                    </AlertDescription>
                </Alert>
                <div class="space-y-2">
                    <Label>Currency</Label>
                    <CurrencyWidget v-model="selectedCurrency" />
                </div>

                <!-- Tax Type Selection -->
                <div class="space-y-2">
                    <Label>Tax Type</Label>
                    <Select v-model="taxSettings.salesTaxType">
                        <SelectTrigger>
                            <SelectValue :placeholder="taxSettings.salesTaxType" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ITEMS_PRICES_ALREADY_INCLUDE_TAXES">
                                Prices Include Taxes
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
                    <Input v-model="taxSettings.taxName"
                           placeholder="e.g., VAT, GST, HST" />
                </div>

                <div class="space-y-2">
                    <Label>Currency Symbol</Label>
                    <Input v-model="taxSettings.currencySymbol"
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
                    <Input v-model="taxSettings.taxRateForDelivery"
                           type="number"
                           step="1" />
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