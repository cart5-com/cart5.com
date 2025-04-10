<script setup lang="ts">
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { ref, computed } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type ServiceFee } from '@lib/zod/serviceFee';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

pageTitle.value = 'Service Fees'

const subtotal = ref(100);

const platformServiceFee = ref<ServiceFee>({
    ratePerOrder: 1,
    feePerOrder: 0,
});

const partnerServiceFee = ref<ServiceFee>({
    ratePerOrder: 2,
    feePerOrder: 0,
});

const marketingPartner = ref<ServiceFee>({
    ratePerOrder: 12,
    feePerOrder: 0,
});

const calculationType = ref<"add" | "include">("include");
const includedBufferPercentage = ref(10);

const allowedFeeTotalIncluded = computed(() => {
    return subtotal.value * ((includedBufferPercentage.value ?? 0) / 100);
});

const totalApplicationFee = function () {
    const platformFeePercent = subtotal.value * ((platformServiceFee.value.ratePerOrder ?? 0) / 100);
    const platformFeeFixed = platformServiceFee.value.feePerOrder ?? 0;
    const partnerFeePercent = subtotal.value * ((partnerServiceFee.value.ratePerOrder ?? 0) / 100);
    const partnerFeeFixed = partnerServiceFee.value.feePerOrder ?? 0;
    const marketingFeePercent = subtotal.value * ((marketingPartner.value.ratePerOrder ?? 0) / 100);
    const marketingFeeFixed = marketingPartner.value.feePerOrder ?? 0;
    return platformFeePercent + platformFeeFixed + partnerFeePercent + partnerFeeFixed + marketingFeePercent + marketingFeeFixed;
}

const cartTotal = computed(() => {
    const totalFees = totalApplicationFee();
    if (calculationType.value === "add") {
        return subtotal.value + totalFees;
    } else {
        if (totalFees > allowedFeeTotalIncluded.value) {
            return subtotal.value + (totalFees - allowedFeeTotalIncluded.value);
        } else {
            return subtotal.value;
        }
    }
});

const storeReceives = computed(() => {
    return cartTotal.value - totalApplicationFee();
});

const minStoreReceives = () => {
    if (calculationType.value === "add") {
        return cartTotal.value - totalApplicationFee();
    } else {
        return cartTotal.value - allowedFeeTotalIncluded.value;
    }
}

</script>

<template>
    <div class="max-w-lg mx-auto">
        <h1>Service Fees</h1>
        <div class="grid gap-4 py-4 border rounded-lg p-4 bg-card">


            <!-- Platform Service Fee -->
            <div class="pt-4 border-t">
                <h3 class="font-medium">Platform Service Fee</h3>
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
                <h3 class="font-medium">Partner Service Fee</h3>
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
                <h3 class="font-medium">Marketing Partner</h3>
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
                            <SelectItem value="add">Add to total</SelectItem>
                            <SelectItem value="include">Included in total</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div class="grid grid-cols-4 items-center gap-4"
                 v-if="calculationType === 'include'">
                <Label for="includedBufferPercentage"
                       class="text-right">
                    Buffer %
                </Label>
                <Input id="includedBufferPercentage"
                       type="number"
                       min="0"
                       step="1"
                       class="col-span-3"
                       v-model="includedBufferPercentage" />
            </div>

            <div class="grid grid-cols-4 items-center gap-4 pt-4 border-t">
                <Label for="cartTotal"
                       class="text-right">
                    Cart Subtotal
                </Label>
                <Input id="cartTotal"
                       type="number"
                       min="0"
                       step="1"
                       class="col-span-3"
                       v-model="subtotal" />
            </div>
            Buyer pays: {{ cartTotal.toFixed(2) }}
            <br>
            <span>Store receives: {{ storeReceives.toFixed(2) }}</span>
            <span v-if="calculationType === 'include'">
                Store receives min: {{ (subtotal - allowedFeeTotalIncluded).toFixed(2) }}
                <br>
                Note: calculation will never be less than this amount.
            </span>
            <br>
            Application fees: {{ totalApplicationFee().toFixed(2) }}
        </div>
    </div>
</template>