<script setup lang="ts">
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { ref, onMounted, computed } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { type ServiceFee } from '@lib/zod/serviceFee';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dashboardApiClient } from "@api-client/dashboard";
import { currentStoreId } from "@dashboard-spa-vue/stores/MyStoresStore";
import { toast } from "@/ui-plus/sonner";
import { getJurisdictionSalesTaxRate } from '@lib/utils/sales_tax_rates';
import { ipwhois } from '@/ui-plus/geolocation-selection-map/ipwhois';

pageTitle.value = 'Service Fees'

const taxSettings = ref<ReturnType<typeof getJurisdictionSalesTaxRate> | null>(null);

interface CartItem {
    name: string;
    total: number;
    taxes: number;
}

const items = ref<CartItem[]>([
    { name: 'Item 1', total: 50, taxes: 0 },
    { name: 'Item 2', total: 50, taxes: 0 },
]);

const isLoading = ref(false);
const calculationType = ref<"ADD" | "INCLUDE">("INCLUDE");
const includedServiceFeeRate = ref(0);
const offerDiscountIfPossible = ref(false);

function addItem() {
    items.value.push({
        name: `Item ${items.value.length + 1}`,
        total: 0,
        taxes: 0
    });
}

function removeItem(index: number) {
    if (items.value.length > 1) {
        items.value.splice(index, 1);
    }
}

onMounted(async () => {
    const ipWhoisResult = await ipwhois();
    taxSettings.value = getJurisdictionSalesTaxRate(ipWhoisResult.country_code ?? '', ipWhoisResult.region_code ?? '');
    updateItemTaxes();
    loadServiceFees();
});

function updateItemTaxes() {
    if (!taxSettings.value) return;

    for (const item of items.value) {
        item.taxes = (taxSettings.value.taxRate ?? 0) / 100 * item.total;
    }
}

const platformServiceFee = ref<ServiceFee>({
    ratePerOrder: 1,
    feePerOrder: 0,
});

const partnerServiceFee = ref<ServiceFee>({
    ratePerOrder: 2,
    feePerOrder: 0,
});

const marketingPartner = ref<ServiceFee>({
    ratePerOrder: 3,
    feePerOrder: 0,
});

const totalServiceFeesTax = computed(() => {
    return (taxSettings.value?.taxRate ?? 0) / 100 * totalServiceFees.value;
});

const allItemsTotal = computed(() => {
    return items.value.reduce((sum, item) => sum + item.total, 0);
});

const allItemsTaxes = computed(() => {
    return items.value.reduce((sum, item) => sum + item.taxes, 0);
});

const totalServiceFees = computed(() => {
    const platformFeePercent = allItemsTotal.value * ((platformServiceFee.value.ratePerOrder ?? 0) / 100);
    const platformFeeFixed = platformServiceFee.value.feePerOrder ?? 0;
    const partnerFeePercent = allItemsTotal.value * ((partnerServiceFee.value.ratePerOrder ?? 0) / 100);
    const partnerFeeFixed = partnerServiceFee.value.feePerOrder ?? 0;
    const marketingFeePercent = allItemsTotal.value * ((marketingPartner.value.ratePerOrder ?? 0) / 100);
    const marketingFeeFixed = marketingPartner.value.feePerOrder ?? 0;

    return platformFeePercent + platformFeeFixed + partnerFeePercent + partnerFeeFixed + marketingFeePercent + marketingFeeFixed;
});

const allowedFeeTotalIfIncluded = computed(() =>
    allItemsTotal.value * ((includedServiceFeeRate.value ?? 0) / 100)
);

const serviceFeeTaxNeedToPayByBuyer = computed(() => {
    return (taxSettings.value?.taxRate ?? 0) / 100 * serviceFeeNeedToPayByBuyer.value;
});
const serviceFeeNeedToPayByBuyer = computed(() => {
    if (calculationType.value === "INCLUDE") {
        const amount = totalServiceFees.value - allowedFeeTotalIfIncluded.value;
        return amount > 0 ? amount : 0;
    } else {
        return totalServiceFees.value;
    }
});

const offerableDiscountAmount = computed(() => {
    if (offerDiscountIfPossible.value) {
        const amount = allowedFeeTotalIfIncluded.value - totalServiceFees.value;
        return amount > 0 ? amount : 0;
    } else {
        return 0;
    }
});

const taxesTotal = computed(() => {
    return allItemsTaxes.value + serviceFeeTaxNeedToPayByBuyer.value;
});

const buyerPaysTotal = computed(() =>
    allItemsTotal.value + serviceFeeNeedToPayByBuyer.value - offerableDiscountAmount.value + taxesTotal.value
);

const storeReceivesTotal = computed(() =>
    allItemsTotal.value - offerableDiscountAmount.value - totalServiceFees.value +
    serviceFeeNeedToPayByBuyer.value
);

const storeReceivesTotalTax = computed(() =>
    taxesTotal.value - totalServiceFeesTax.value
);

async function loadServiceFees() {
    if (!currentStoreId.value) return;

    isLoading.value = true;
    try {
        const { data, error } = await (await dashboardApiClient.store[':storeId'].menu.get.$post({
            param: {
                storeId: currentStoreId.value,
            },
            json: {
                columns: {
                    calculationType: true,
                    includedServiceFeeRate: true,
                    offerDiscountIfPossible: true
                }
            }
        })).json();

        if (error) {
            toast.error('Failed to load service fees settings');
        } else if (data) {
            calculationType.value = data.calculationType || calculationType.value;
            includedServiceFeeRate.value = data.includedServiceFeeRate || includedServiceFeeRate.value;
            offerDiscountIfPossible.value = data.offerDiscountIfPossible || offerDiscountIfPossible.value;
        }
    } catch (err) {
        toast.error('Error loading service fees settings');
    } finally {
        isLoading.value = false;
    }
}

async function saveSettings() {
    if (!currentStoreId.value) {
        toast.error('No store selected');
        return;
    }

    isLoading.value = true;
    try {
        const { error } = await (await dashboardApiClient.store[':storeId'].menu.update.$patch({
            param: {
                storeId: currentStoreId.value,
            },
            json: {
                calculationType: calculationType.value,
                includedServiceFeeRate: includedServiceFeeRate.value,
                offerDiscountIfPossible: offerDiscountIfPossible.value
            }
        })).json();

        if (error) {
            toast.error('Failed to save service fees settings');
        } else {
            toast.success('Service fees settings saved successfully');
        }
    } catch (err) {
        toast.error('Error saving service fees settings');
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <div class="max-w-lg mx-auto">
        <h1>Service Fees</h1>
        <div class="grid gap-4 py-4 border rounded-lg p-4 bg-card">
            <!-- Calculation Settings -->
            <div class="pt-4 border-t">
                <h3 class="font-medium">Calculation Settings</h3>
            </div>
            <div class="grid grid-cols-3 items-center gap-4">
                <Label for="calculationType"
                       class="text-right">
                    Method
                </Label>
                <div class="col-span-2">
                    <Select v-model="calculationType"
                            class="w-full">
                        <SelectTrigger>
                            <SelectValue placeholder="Select calculation type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ADD">Add to total</SelectItem>
                            <SelectItem value="INCLUDE">Service fees included in item prices</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div class="grid grid-cols-3 items-center gap-4"
                 v-if="calculationType === 'INCLUDE'">
                <Label class="text-right">
                    Up to rate %
                </Label>
                <Input type="number"
                       min="0"
                       step="1"
                       class="col-span-2"
                       v-model="includedServiceFeeRate" />
            </div>
            <div class="grid grid-cols-2 items-center gap-4"
                 v-if="calculationType === 'INCLUDE'">
                <Label class="text-right">
                    Offer store discount if possible
                </Label>
                <Switch id="offerDiscountIfPossible"
                        :checked="offerDiscountIfPossible"
                        @update:checked="(checked) => offerDiscountIfPossible = checked"
                        class="scale-125">
                </Switch>
            </div>

            <Button @click="saveSettings"
                    :disabled="isLoading">
                {{ isLoading ? 'Saving...' : 'Save Settings' }}
            </Button>

            <!-- tax settings -->
            <div class="text-sm text-muted-foreground mb-4 pt-4 border-t"
                 v-if="taxSettings">
                Tax settings: <Input type="text"
                       v-model="taxSettings.taxName" />
                <Input type="number"
                       min="0"
                       step="1"
                       class="col-span-3"
                       v-model="taxSettings.taxRate"
                       @update:modelValue="updateItemTaxes" />
            </div>

            <div class="pt-4 border-t">
                <h2 class="font-medium">Sample calculation:</h2>
                <div class="flex justify-end mb-2">
                    <Button size="sm"
                            @click="addItem"
                            class="mr-2">Add Item</Button>
                    <Button size="sm"
                            variant="destructive"
                            @click="removeItem(items.length - 1)"
                            :disabled="items.length <= 1">
                        Remove Item
                    </Button>
                </div>
                <div class="grid grid-cols-12 gap-2 mt-4">

                    <!-- headers -->
                    <div class="col-span-3 border-t pt-2"> </div>
                    <div class="col-span-3 text-right border-t pt-2">price</div>
                    <div class="col-span-3 text-right border-t pt-2">tax</div>
                    <div class="col-span-3 text-right border-t pt-2">Total</div>

                    <!-- Dynamic Items -->
                    <template v-for="(item, index) in items"
                              :key="index">
                        <div class="col-span-3 border-t pt-2">{{ item.name }}</div>
                        <div class="col-span-3 text-right border-t pt-2">
                            <Input type="number"
                                   min="0"
                                   step="0.01"
                                   class="text-right"
                                   v-model="item.total"
                                   @update:modelValue="updateItemTaxes" />
                        </div>
                        <div class="col-span-3 text-right border-t pt-2">
                            <Input type="number"
                                   min="0"
                                   step="0.01"
                                   class="text-right"
                                   v-model="item.taxes" />
                        </div>
                        <div class="col-span-3 text-right border-t pt-2">
                            {{ (item.total + item.taxes).toFixed(2) }}
                        </div>
                    </template>

                    <!-- Service fees -->
                    <div class="col-span-3 text-destructive">Service fees</div>
                    <div class="col-span-3 text-right text-destructive">
                        {{ serviceFeeNeedToPayByBuyer.toFixed(2) }}
                    </div>
                    <div class="col-span-3 text-right text-destructive">
                        {{ serviceFeeTaxNeedToPayByBuyer.toFixed(2) }}
                    </div>
                    <div class="col-span-3 text-right text-destructive">
                        {{ (serviceFeeNeedToPayByBuyer + serviceFeeTaxNeedToPayByBuyer).toFixed(2) }}
                    </div>

                    <!-- Subtotal - only shown if discount applies -->
                    <div class="col-span-3 font-medium">Subtotal</div>
                    <div class="col-span-3 text-right font-medium">
                        {{ (allItemsTotal + serviceFeeNeedToPayByBuyer).toFixed(2) }}
                    </div>
                    <div class="col-span-3 text-right font-medium">
                        {{ (allItemsTaxes + serviceFeeTaxNeedToPayByBuyer).toFixed(2) }}
                    </div>
                    <div class="col-span-3 text-right font-medium">
                        {{ (allItemsTotal + allItemsTaxes + serviceFeeNeedToPayByBuyer + serviceFeeTaxNeedToPayByBuyer).toFixed(2) }}
                    </div>

                    <!-- Discount -->
                    <div class="col-span-3 text-primary">Discount</div>
                    <div class="col-span-3 text-right text-primary">-{{ offerableDiscountAmount.toFixed(2) }}</div>
                    <div class="col-span-3 text-right text-primary">0.00</div>
                    <div class="col-span-3 text-right text-primary">-{{ offerableDiscountAmount.toFixed(2) }}</div>

                    <!-- Buyer pays total -->
                    <div class="col-span-3 font-bold border-t pt-2">Buyer pays total</div>
                    <div class="col-span-3 text-right font-bold border-t pt-2"></div>
                    <div class="col-span-3 text-right font-bold border-t pt-2"></div>
                    <div class="col-span-3 text-right font-bold border-t pt-2 text-2xl">{{ buyerPaysTotal.toFixed(2) }}
                    </div>

                    <!-- Total service fees -->
                    <div class="col-span-3 border-t pt-2 text-sm">Total service fees</div>
                    <div class="col-span-3 text-right border-t pt-2 text-sm">{{ totalServiceFees.toFixed(2) }}</div>
                    <div class="col-span-3 text-right border-t pt-2 text-sm">{{ totalServiceFeesTax.toFixed(2) }}</div>
                    <div class="col-span-3 text-right border-t pt-2 text-sm">
                        {{ (totalServiceFees + totalServiceFeesTax).toFixed(2) }}
                    </div>

                    <!-- Store receives -->
                    <div class="col-span-3 font-bold border-t pt-2 text-sm">Store receives</div>
                    <div class="col-span-3 text-right font-bold border-t pt-2 text-sm">
                        {{ storeReceivesTotal.toFixed(2) }}
                    </div>
                    <div class="col-span-3 text-right font-bold border-t pt-2 text-sm">
                        {{ storeReceivesTotalTax.toFixed(2) }}
                    </div>
                    <div class="col-span-3 text-right font-bold border-t pt-2 text-sm">
                        {{ (storeReceivesTotal + storeReceivesTotalTax).toFixed(2) }}
                    </div>
                </div>
            </div>


            <div class="border p-2 rounded-lg">
                <div class="font-medium">
                    Application fees details:
                </div>

                <!-- Platform Service Fee -->
                <div class="pt-4 border-t">
                    <h3 class="font-medium">Platform Service Fee
                        <span class="text-sm text-muted-foreground">
                            +/-
                        </span>
                    </h3>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="platformRatePerOrder"
                           class="text-right">
                        Rate %
                    </Label>
                    <Input id="platformRatePerOrder"
                           type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="platformServiceFee.ratePerOrder" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="platformFeePerOrder"
                           class="text-right">
                        Fixed Fee
                    </Label>
                    <Input id="platformFeePerOrder"
                           type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="platformServiceFee.feePerOrder" />
                </div>

                <!-- Partner Service Fee -->
                <div class="pt-4 border-t">
                    <h3 class="font-medium">Partner Service Fee
                        <span class="text-sm text-muted-foreground">
                            +/-
                        </span>
                    </h3>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="partnerRatePerOrder"
                           class="text-right">
                        Rate %
                    </Label>
                    <Input id="partnerRatePerOrder"
                           type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="partnerServiceFee.ratePerOrder" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="partnerFeePerOrder"
                           class="text-right">
                        Fixed Fee
                    </Label>
                    <Input id="partnerFeePerOrder"
                           type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="partnerServiceFee.feePerOrder" />
                </div>

                <!-- Marketing Partner -->
                <div class="pt-4 border-t">
                    <h3 class="font-medium">Marketing Partner
                        <span class="text-sm text-muted-foreground">
                            +/-
                        </span>
                    </h3>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="marketingPartnerRatePerOrder"
                           class="text-right">
                        Rate %
                    </Label>
                    <Input id="marketingPartnerRatePerOrder"
                           type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="marketingPartner.ratePerOrder" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="marketingPartnerFeePerOrder"
                           class="text-right">
                        Fixed Fee
                    </Label>
                    <Input id="marketingPartnerFeePerOrder"
                           type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="marketingPartner.feePerOrder" />
                </div>
            </div>
        </div>
    </div>
</template>