<script setup lang="ts">
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { ref, onMounted } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { type ServiceFee } from '@lib/zod/serviceFee';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dashboardApiClient } from "@api-client/dashboard";
import { currentStoreId } from "@dashboard-spa-vue/stores/MyStoresStore";
import { toast } from "@/ui-plus/sonner";

pageTitle.value = 'Service Fees'

const itemTotal = ref(100);
onMounted(async () => {
    await loadServiceFees();
});
const platformServiceFee = ref<ServiceFee>({
    ratePerOrder: 1, // readonly
    feePerOrder: 0,// readonly
});

const partnerServiceFee = ref<ServiceFee>({
    ratePerOrder: 2, // readonly
    feePerOrder: 0, // readonly
});

const marketingPartner = ref<ServiceFee>({
    ratePerOrder: 3, // readonly
    feePerOrder: 0, // readonly
});
const calculationType = ref<"ADD" | "INCLUDE">("INCLUDE");
const includedServiceFeeRate = ref(0);
const offerDiscountIfPossible = ref(false);
const isLoading = ref(false);

const totalServiceFees = function () {
    const platformFeePercent = itemTotal.value * ((platformServiceFee.value.ratePerOrder ?? 0) / 100);
    const platformFeeFixed = platformServiceFee.value.feePerOrder ?? 0;
    const partnerFeePercent = itemTotal.value * ((partnerServiceFee.value.ratePerOrder ?? 0) / 100);
    const partnerFeeFixed = partnerServiceFee.value.feePerOrder ?? 0;
    const marketingFeePercent = itemTotal.value * ((marketingPartner.value.ratePerOrder ?? 0) / 100);
    const marketingFeeFixed = marketingPartner.value.feePerOrder ?? 0;

    return platformFeePercent + platformFeeFixed + partnerFeePercent + partnerFeeFixed + marketingFeePercent + marketingFeeFixed;
}

const allowedFeeTotalIfIncluded = () => {
    return itemTotal.value * ((includedServiceFeeRate.value ?? 0) / 100);
}


const serviceFeeNeedToPayByBuyer = () => {
    if (calculationType.value === "INCLUDE") {
        const amount = totalServiceFees() - allowedFeeTotalIfIncluded()
        return amount > 0 ? amount : 0;
    } else {
        return totalServiceFees();
    }
}


const offerableDiscountAmount = () => {
    if (offerDiscountIfPossible.value) {
        const amount = allowedFeeTotalIfIncluded() - totalServiceFees();
        return amount > 0 ? amount : 0;
    } else {
        return 0;
    }
}

const buyerPaysTotal = () => {
    return itemTotal.value + serviceFeeNeedToPayByBuyer() - offerableDiscountAmount();
}

const storeReceivesTotal = () => {
    return buyerPaysTotal() - totalServiceFees();
}

const loadServiceFees = async () => {
    isLoading.value = true;
    const { data, error } = await (await dashboardApiClient.store[':storeId'].menu.get.$post({
        param: {
            storeId: currentStoreId.value ?? '',
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
        if (data.calculationType) {
            calculationType.value = data.calculationType;
        }
        if (data.includedServiceFeeRate) {
            includedServiceFeeRate.value = data.includedServiceFeeRate;
        }
        if (data.offerDiscountIfPossible) {
            offerDiscountIfPossible.value = data.offerDiscountIfPossible;
        }
    }
    isLoading.value = false;
}

const saveSettings = async () => {
    if (!currentStoreId.value) {
        toast.error('No store selected');
        return;
    }

    isLoading.value = true;
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
    isLoading.value = false;
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
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="calculationType"
                       class="text-right">
                    Method
                </Label>
                <div class="col-span-3">
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
            <div class="grid grid-cols-4 items-center gap-4"
                 v-if="calculationType === 'INCLUDE'">
                <Label class="text-right">
                    Up to rate %
                </Label>
                <Input type="number"
                       min="0"
                       step="1"
                       class="col-span-3"
                       v-model="includedServiceFeeRate" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4"
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

            <div class="pt-4 border-t">
                <h2 class="font-medium">Sample calculation:</h2>
                <div class="grid grid-cols-12 gap-2 mt-4">
                    <!-- Headers -->
                    <div class="col-span-8 font-medium">Item</div>
                    <div class="col-span-4 text-right font-medium">Amount</div>

                    <!-- Item total -->
                    <div class="col-span-8 border-t pt-2">Item(s) total</div>
                    <div class="col-span-4 text-right border-t pt-2">
                        <Input type="number"
                               min="0"
                               step="0.01"
                               class="text-right"
                               v-model="itemTotal" />
                    </div>

                    <!-- Service fees -->
                    <template v-if="serviceFeeNeedToPayByBuyer() > 0">
                        <div class="col-span-8 text-destructive">Service fees</div>
                        <div class="col-span-4 text-right text-destructive">
                            +{{ serviceFeeNeedToPayByBuyer().toFixed(2) }}</div>
                    </template>

                    <!-- Subtotal - only shown if discount applies -->
                    <template v-if="offerableDiscountAmount() > 0">
                        <div class="col-span-8 font-medium">Subtotal</div>
                        <div class="col-span-4 text-right font-medium">
                            {{ (itemTotal + serviceFeeNeedToPayByBuyer()).toFixed(2) }}
                        </div>

                        <!-- Discount -->
                        <div class="col-span-8 text-primary">Discount</div>
                        <div class="col-span-4 text-right text-primary">-{{ offerableDiscountAmount().toFixed(2) }}
                        </div>
                    </template>

                    <!-- Buyer pays total -->
                    <div class="col-span-8 font-bold border-t pt-2">Buyer pays total</div>
                    <div class="col-span-4 text-right font-bold border-t pt-2">{{ buyerPaysTotal().toFixed(2) }}</div>

                    <!-- Total service fees -->
                    <div class="col-span-8 border-t pt-2">Total service fees</div>
                    <div class="col-span-4 text-right border-t pt-2">{{ totalServiceFees().toFixed(2) }}</div>

                    <!-- Store receives -->
                    <div class="col-span-8 font-bold border-t pt-2">Store receives</div>
                    <div class="col-span-4 text-right font-bold border-t pt-2">{{ storeReceivesTotal().toFixed(2) }}
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