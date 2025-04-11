<script setup lang="ts">
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { ref, computed, onMounted } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type ServiceFee, type CustomServiceFeeByStore, ALL_SERVICE_FEE_CONDITIONS } from '@lib/zod/serviceFee';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlusIcon, Trash2 as TrashIcon } from 'lucide-vue-next';
import { getJurisdictionSalesTaxRate } from '@lib/utils/sales_tax_rates';
import { ipwhois } from '@/ui-plus/geolocation-selection-map/ipwhois';

pageTitle.value = 'Service Fees'

const subtotal = ref(100);

const taxSettings = ref<ReturnType<typeof getJurisdictionSalesTaxRate> | null>(null);

onMounted(async () => {
    const ipWhoisResult = await ipwhois();
    taxSettings.value = getJurisdictionSalesTaxRate(ipWhoisResult.country_code ?? '', ipWhoisResult.region_code ?? '');
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
    ratePerOrder: 5, // readonly
    feePerOrder: 0, // readonly
});

const customServiceFeesByStore = ref<CustomServiceFeeByStore[]>([
    // {
    //     name: 'Stripe',
    //     ratePerOrder: 2.9,
    //     feePerOrder: 0.30,
    //     condition: 'STRIPE',
    //     taxRate: 0
    // },
]);

const addNewCustomServiceFeeByStore = () => {
    customServiceFeesByStore.value.push({
        name: `Service Fee ${customServiceFeesByStore.value.length + 1}`,
        ratePerOrder: 0,
        feePerOrder: 0,
        condition: 'ALL_ORDERS',
        taxRate: 0
    });
};

const removeCustomServiceFeeByStore = (index: number) => {
    customServiceFeesByStore.value.splice(index, 1);
};

const calculationType = ref<"add" | "include">("include");
const includedBufferPercentage = ref(10);

const allowedFeeTotalIncluded = () => {
    return subtotal.value * ((includedBufferPercentage.value ?? 0) / 100);
};

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

    // Calculate all custom service fees
    let total_CustomServiceFeesByStore = 0;
    for (const fee of customServiceFeesByStore.value) {
        const percentFee = subtotal.value * ((fee.ratePerOrder ?? 0) / 100);
        const fixedFee = fee.feePerOrder ?? 0;
        total_CustomServiceFeesByStore += percentFee + fixedFee;
    }

    return platformFeePercent + platformFeeFixed + partnerFeePercent + partnerFeeFixed + marketingFeePercent + marketingFeeFixed + total_CustomServiceFeesByStore;
}

const cartTotal = computed(() => {
    const totalFees = totalApplicationFee();
    if (calculationType.value === "add") {
        return subtotal.value + totalFees;
    } else {
        if (totalFees > allowedFeeTotalIncluded()) {
            return subtotal.value + (totalFees - allowedFeeTotalIncluded());
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
                            <SelectItem value="include">Service fees included in menu prices</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div class="grid grid-cols-4 items-center gap-4"
                 v-if="calculationType === 'include'">
                <Label class="text-right">
                    Buffer %
                </Label>
                <Input type="number"
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
                <div class="col-span-4">
                    Buyer pays: {{ cartTotal.toFixed(2) }}
                    <br>
                    <span>Store receives: {{ storeReceives.toFixed(2) }}</span>
                    <span v-if="calculationType === 'include'">
                        <br>
                        Store receives min: {{ (subtotal - allowedFeeTotalIncluded()).toFixed(2) }}
                    </span>
                    <br>
                    Application fees: {{ totalApplicationFee().toFixed(2) }}
                </div>
            </div>

            <div class="border p-2 rounded-lg">
                <div class="text-sm text-muted-foreground mb-4">
                    Readonly service fees
                </div>
                <!-- tax settings -->
                <div class="text-sm text-muted-foreground mb-4"
                     v-if="taxSettings">
                    Tax settings: {{ taxSettings?.taxName }}
                    <Input type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="taxSettings.taxRate" />
                </div>

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
            </div>

            <!-- Custom Service Fees -->
            <div class="pt-4 border-t">
                <div class="flex justify-between items-center">
                    <h3 class="font-medium">Store's custom service fees</h3>
                    <Button size="sm"
                            variant="outline"
                            @click="addNewCustomServiceFeeByStore">
                        <PlusIcon class="h-4 w-4 mr-1" />
                        Add Fee
                    </Button>
                </div>
            </div>

            <div v-for="(fee, index) in customServiceFeesByStore"
                 :key="index"
                 class="grid gap-4 mt-2 p-3 border rounded-md">
                <div class="grid grid-cols-4 items-center gap-4">
                    <div class="col-span-4">
                        {{ getTTT(fee).toFixed(2) }}
                    </div>
                    <Label class="text-right">
                        Name
                    </Label>
                    <div class="col-span-3 flex gap-2">
                        <Input type="text"
                               class="flex-1"
                               v-model="fee.name" />
                        <Button size="icon"
                                variant="destructive"
                                @click="removeCustomServiceFeeByStore(index)">
                            <TrashIcon class="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">
                        Rate %
                    </Label>
                    <Input type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="fee.ratePerOrder" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">
                        Fixed Fee
                    </Label>
                    <Input type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="fee.feePerOrder" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">
                        Condition
                    </Label>
                    <div class="col-span-3">
                        <Select v-model="fee.condition"
                                class="w-full">
                            <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="condition in ALL_SERVICE_FEE_CONDITIONS"
                                            :key="condition"
                                            :value="condition">
                                    {{ condition }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">
                        Tax Rate %
                    </Label>
                    <Input type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="fee.taxRate" />
                </div>
            </div>


        </div>
    </div>
</template>