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
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { currentRestaurantId } from '@src/stores/RestaurantStore';
import type { TaxDetails } from 'lib/types/restaurantTypes';
import { pageTitle } from '@src/stores/layout.store';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-vue-next'
import CurrencyWidget from './CurrencyWidget.vue';

pageTitle.value = 'Tax Settings';

// TODO: we may pre-populate the tax categories with some default ones from the address.
const isLoading = ref(false);
const getDefaultTaxCategory = () => {
    return {
        id: crypto.randomUUID(),
        name: 'Food',
        deliveryRate: undefined,
        pickupRate: undefined,
        inBusinessRate: undefined
    }
}
const defaultTaxSettings = {
    salesTaxType: 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES',
    taxName: 'VAT',
    taxRateForDelivery: undefined,
    taxCategories: [getDefaultTaxCategory()]
}
const taxSettings = ref<TaxDetails>(JSON.parse(JSON.stringify(defaultTaxSettings)));

const selectedCurrency = ref('GBP');

const loadData = async () => {
    isLoading.value = true;
    try {
        const { data, error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$post({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                columns: {
                    taxSettings: {
                        taxSettings: true,
                        currency: true,
                    }
                }
            }
        })).json();

        if (error) {
            toast.error('Failed to load tax settings');
            return;
        }

        if (data?.taxSettings) {
            taxSettings.value = data.taxSettings.taxSettings ?? JSON.parse(JSON.stringify(defaultTaxSettings));
            selectedCurrency.value = data.taxSettings.currency ?? 'GBP';
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
        const { error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                taxSettings: {
                    currency: selectedCurrency.value,
                    taxSettings: taxSettings.value
                }
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
    taxSettings.value.taxCategories.push({
        id: crypto.randomUUID(),
        name: 'Cat ' + (taxSettings.value.taxCategories.length + 1),
        deliveryRate: 0,
        pickupRate: 0,
        inBusinessRate: 0
    });
};

const removeTaxCategory = (index: number) => {
    taxSettings.value.taxCategories.splice(index, 1);
};

onMounted(() => {
    loadData();
});
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
                <Alert variant="destructive">
                    <AlertCircle class="w-4 h-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                        Please note that it is your responsibility to confirm that any and all currency and taxes are
                        accurate for the applicable jurisdiction. We assume no liability related to the accuracy of the
                        currency and/or taxes or to the appropriate collection and/or payment of such taxes as part of
                        its products and services.
                    </AlertDescription>
                </Alert>
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
                                   placeholder="Category Name"
                                   class="max-w-[200px]" />
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
                            <div class="space-y-2">
                                <Label>In-Store Rate (%)</Label>
                                <Input v-model="category.inBusinessRate"
                                       type="number"
                                       step="1" />
                            </div>
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