<script setup lang="ts">
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { ref, computed } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type ServiceFee } from '@lib/zod/serviceFee';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlusIcon, Trash2 as TrashIcon } from 'lucide-vue-next';

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

type OtherStoreServiceFee = {
    name?: string;
    ratePerOrder?: number;
    feePerOrder?: number;
}
const otherStoreServiceFees = ref<OtherStoreServiceFee[]>([
    {
        name: 'Stripe',
        ratePerOrder: 2.9,
        feePerOrder: 0.30,
    },
]);

const addOtherServiceFee = () => {
    otherStoreServiceFees.value.push({
        name: '',
        ratePerOrder: 0,
        feePerOrder: 0
    });
};

const removeOtherServiceFee = (index: number) => {
    otherStoreServiceFees.value.splice(index, 1);
};

const calculationType = ref<"add" | "include">("include");
const includedBufferPercentage = ref(10);

const allowedFeeTotalIncluded = computed(() => {
    return subtotal.value * ((includedBufferPercentage.value ?? 0) / 100);
});

const getTTT = function (serviceFee: ServiceFee) {
    return (subtotal.value * ((serviceFee.ratePerOrder ?? 0) / 100)) + (serviceFee.feePerOrder ?? 0);
}

const totalApplicationFee = function () {
    const platformFeePercent = subtotal.value * ((platformServiceFee.value.ratePerOrder ?? 0) / 100);
    const platformFeeFixed = platformServiceFee.value.feePerOrder ?? 0;
    const partnerFeePercent = subtotal.value * ((partnerServiceFee.value.ratePerOrder ?? 0) / 100);
    const partnerFeeFixed = partnerServiceFee.value.feePerOrder ?? 0;
    const marketingFeePercent = subtotal.value * ((marketingPartner.value.ratePerOrder ?? 0) / 100);
    const marketingFeeFixed = marketingPartner.value.feePerOrder ?? 0;

    // Calculate other service fees
    let otherFeesTotal = 0;
    for (const fee of otherStoreServiceFees.value) {
        const percentFee = subtotal.value * ((fee.ratePerOrder ?? 0) / 100);
        const fixedFee = fee.feePerOrder ?? 0;
        otherFeesTotal += percentFee + fixedFee;
    }

    return platformFeePercent + platformFeeFixed + partnerFeePercent + partnerFeeFixed + marketingFeePercent + marketingFeeFixed + otherFeesTotal;
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

</script>

<template>
    <div class="max-w-lg mx-auto">
        <h1>Service Fees</h1>
        <div class="grid gap-4 py-4 border rounded-lg p-4 bg-card">


            <!-- Platform Service Fee -->
            <div class="pt-4 border-t">
                <h3 class="font-medium">Platform Service Fee
                    <span class="text-sm text-muted-foreground">
                        ({{ getTTT(platformServiceFee).toFixed(2) }})
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
                        ({{ getTTT(partnerServiceFee).toFixed(2) }})
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
                        ({{ getTTT(marketingPartner).toFixed(2) }})
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

            <!-- Other Store Service Fees -->
            <div class="pt-4 border-t">
                <div class="flex justify-between items-center">
                    <h3 class="font-medium">Other Store Service Fees</h3>
                    <Button size="sm"
                            variant="outline"
                            @click="addOtherServiceFee">
                        <PlusIcon class="h-4 w-4 mr-1" />
                        Add Fee
                    </Button>
                </div>
            </div>

            <div v-for="(fee, index) in otherStoreServiceFees"
                 :key="index"
                 class="grid gap-4 mt-2 p-3 border rounded-md">
                <div class="grid grid-cols-4 items-center gap-4">
                    <div class="col-span-4">
                        {{ getTTT(fee).toFixed(2) }}
                    </div>
                    <Label :for="`otherFeeName${index}`"
                           class="text-right">
                        Name
                    </Label>
                    <div class="col-span-3 flex gap-2">
                        <Input :id="`otherFeeName${index}`"
                               type="text"
                               class="flex-1"
                               v-model="fee.name" />
                        <Button size="icon"
                                variant="destructive"
                                @click="removeOtherServiceFee(index)">
                            <TrashIcon class="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label :for="`otherFeeRate${index}`"
                           class="text-right">
                        Rate %
                    </Label>
                    <Input :id="`otherFeeRate${index}`"
                           type="number"
                           min="0"
                           step="0.1"
                           class="col-span-3"
                           v-model="fee.ratePerOrder" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label :for="`otherFeeFixed${index}`"
                           class="text-right">
                        Fixed Fee
                    </Label>
                    <Input :id="`otherFeeFixed${index}`"
                           type="number"
                           min="0"
                           step="0.01"
                           class="col-span-3"
                           v-model="fee.feePerOrder" />
                </div>
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