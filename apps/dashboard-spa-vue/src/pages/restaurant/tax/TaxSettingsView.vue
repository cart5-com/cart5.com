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
import { currentRestaurantId } from '@src/stores/RestaurantStore';
import type { TaxCategory } from '@lib/types/restaurantTypes';
import { pageTitle } from '@src/stores/layout.store';
import CurrencyWidget from './CurrencyWidget.vue';
import SalesTaxInfoWidget from '@src/pages/restaurant/tax/SalesTaxInfoWidget.vue';
import { fetchCountryCode } from '@/ui-plus/PhoneNumber/basePhoneInput/helpers/use-phone-input';
import { currencies } from '@lib/utils/currencies';
pageTitle.value = 'Tax Settings';

// TODO: we may pre-populate the tax categories with some default ones from the address.
const isLoading = ref(false);
const getDefaultTaxCategory = (): TaxCategory => {
    return {
        id: crypto.randomUUID(),
        name: 'Food',
        deliveryRate: undefined,
        pickupRate: undefined,
        onPremiseRate: undefined,
        tableReservationRate: undefined
    }
}
const defaultTaxSettings: {
    currency?: string;
    salesTaxType?: 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES' | 'APPLY_TAX_ON_TOP_OF_PRICES';
    taxName?: string;
    taxRateForDelivery?: number;
    taxCategories?: TaxCategory[];
} = {
    currency: 'GBP',
    salesTaxType: 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES' as 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES' | 'APPLY_TAX_ON_TOP_OF_PRICES',
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
    fetchCountryCode().then(countryCode => {
        salesTaxInfoWidget.value?.setCountry(countryCode ?? 'GB');
        countryCodeHelper.value = countryCode ?? 'GB';
        selectedCurrency.value = currencies[countryCode ?? 'GB']?.currency ?? 'GBP';
        loadData();
    });
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
                salesTaxType: data.salesTaxType ?? defaultTaxSettings.salesTaxType,
                taxName: data.taxName ?? defaultTaxSettings.taxName,
                taxRateForDelivery: data.taxRateForDelivery ?? defaultTaxSettings.taxRateForDelivery,
            };
            selectedCurrency.value = data.currency ?? 'GBP';
        }
    } catch (err) {
        console.error('Error loading tax settings:', err);
        toast.error('Failed to load tax settings');
    } finally {
        isLoading.value = false;
    }
};

const saveTaxSettings = async () => {
    isLoading.value = true;
    try {
        const { error } = await (await apiClient.dashboard.restaurant[':restaurantId'].tax_settings.update.$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                currency: selectedCurrency.value,
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
        onPremiseRate: 0,
        tableReservationRate: 0
    });
};

const removeTaxCategory = (index: number) => {
    if (taxSettings.value.taxCategories) {
        taxSettings.value.taxCategories.splice(index, 1);
    }
};

const salesTaxInfoWidget = ref<InstanceType<typeof SalesTaxInfoWidget>>();

</script>

<template>
    <div class="max-w-md mx-auto space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
                <CardDescription>Configure your restaurant's tax settings</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <!-- Currency Selection -->
                <!--  -->
                <SalesTaxInfoWidget ref="salesTaxInfoWidget"
                                    :countryCodeHelper="countryCodeHelper" />
                <div class="space-y-2">
                    <Label>Currency</Label>
                    <CurrencyWidget v-model="selectedCurrency" />
                    <!-- <Select v-model="selectedCurrency">
                        <SelectTrigger>
                            <SelectValue :placeholder="selectedCurrency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="currency in currencies"
                                        :key="currency"
                                        :value="currency">
                                {{ currency }}
                            </SelectItem>
                        </SelectContent>
                    </Select> -->
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

                            <!-- ON_PREMISE_DISABLED_FOR_NOW -->
                            <!-- <div class="space-y-2">
                                <Label>On Premise Rate (%)</Label>
                                <Input v-model="category.onPremiseRate"
                                       type="number"
                                       step="1" />
                            </div> -->

                            <!-- TABLE_RESERVATION_DISABLED_FOR_NOW -->
                            <!-- <div class="space-y-2">
                                <Label>Table Reservation Rate (%)</Label>
                                <Input v-model="category.tableReservationRate"
                                       type="number"
                                       step="1" />
                            </div> -->
                        </div>
                    </div>
                </div>

                <div class="space-y-2">
                    <Label>Tax Rate for Delivery (%)</Label>
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