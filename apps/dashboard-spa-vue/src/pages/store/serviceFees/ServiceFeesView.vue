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

const itemTotal = ref(100);
const itemTaxes = ref(0);
const isLoading = ref(false);
const calculationType = ref<"ADD" | "INCLUDE">("INCLUDE");
const includedServiceFeeRate = ref(0);
const offerDiscountIfPossible = ref(false);


onMounted(async () => {
    const ipWhoisResult = await ipwhois();
    taxSettings.value = getJurisdictionSalesTaxRate(ipWhoisResult.country_code ?? '', ipWhoisResult.region_code ?? '');
    itemTaxes.value = (taxSettings.value?.taxRate ?? 0) / 100 * itemTotal.value;
    loadServiceFees();
});

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

// Convert calculation functions to computed properties for better performance
const totalServiceFees = computed(() => {
    const platformFeePercent = itemTotal.value * ((platformServiceFee.value.ratePerOrder ?? 0) / 100);
    const platformFeeFixed = platformServiceFee.value.feePerOrder ?? 0;
    const partnerFeePercent = itemTotal.value * ((partnerServiceFee.value.ratePerOrder ?? 0) / 100);
    const partnerFeeFixed = partnerServiceFee.value.feePerOrder ?? 0;
    const marketingFeePercent = itemTotal.value * ((marketingPartner.value.ratePerOrder ?? 0) / 100);
    const marketingFeeFixed = marketingPartner.value.feePerOrder ?? 0;

    return platformFeePercent + platformFeeFixed + partnerFeePercent + partnerFeeFixed + marketingFeePercent + marketingFeeFixed;
});

const allowedFeeTotalIfIncluded = computed(() =>
    itemTotal.value * ((includedServiceFeeRate.value ?? 0) / 100)
);

const serviceFeeTax = computed(() => {
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

const buyerPaysTotal = computed(() =>
    itemTotal.value + serviceFeeNeedToPayByBuyer.value - offerableDiscountAmount.value
);

const storeReceivesTotal = computed(() =>
    buyerPaysTotal.value - totalServiceFees.value
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
                    Offer discount if possible
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
                       v-model="taxSettings.taxRate" />
            </div>
            <div class="pt-4 border-t">
                <h2 class="font-medium">Sample calculation:</h2>
                <div class="grid grid-cols-12 gap-2 mt-4">

                    <!-- Item total -->
                    <div class="col-span-8 border-t pt-2">Item(s) total</div>
                    <div class="col-span-4 text-right border-t pt-2">
                        <Input type="number"
                               min="0"
                               step="0.01"
                               class="text-right"
                               v-model="itemTotal" />
                    </div>
                    <!-- Item total -->
                    <div class="col-span-8 border-t pt-2">Item(s) taxes</div>
                    <div class="col-span-4 text-right border-t pt-2">
                        <Input type="number"
                               min="0"
                               step="0.01"
                               class="text-right"
                               v-model="itemTaxes" />
                    </div>

                    <!-- Service fees -->
                    <template v-if="serviceFeeNeedToPayByBuyer > 0">
                        <div class="col-span-8 text-destructive">Service fees</div>
                        <div class="col-span-4 text-right text-destructive">
                            +{{ serviceFeeNeedToPayByBuyer.toFixed(2) }}
                        </div>
                        <div class="col-span-8 text-destructive">Service fees tax</div>
                        <div class="col-span-4 text-right text-destructive">
                            +{{ serviceFeeTax.toFixed(2) }}
                        </div>
                    </template>

                    <!-- Subtotal - only shown if discount applies -->
                    <template v-if="offerableDiscountAmount > 0">
                        <div class="col-span-8 font-medium">Subtotal</div>
                        <div class="col-span-4 text-right font-medium">
                            {{ (itemTotal + serviceFeeNeedToPayByBuyer).toFixed(2) }}
                        </div>

                        <!-- Discount -->
                        <div class="col-span-8 text-primary">Discount</div>
                        <div class="col-span-4 text-right text-primary">-{{ offerableDiscountAmount.toFixed(2) }}
                        </div>
                    </template>

                    <!-- Buyer pays total -->
                    <div class="col-span-8 font-bold border-t pt-2">Buyer pays total</div>
                    <div class="col-span-4 text-right font-bold border-t pt-2">{{ buyerPaysTotal.toFixed(2) }}</div>

                    <!-- Total service fees -->
                    <div class="col-span-8 border-t pt-2">Total service fees</div>
                    <div class="col-span-4 text-right border-t pt-2">{{ totalServiceFees.toFixed(2) }}</div>

                    <!-- Store receives -->
                    <div class="col-span-8 font-bold border-t pt-2">Store receives</div>
                    <div class="col-span-4 text-right font-bold border-t pt-2">{{ storeReceivesTotal.toFixed(2) }}
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