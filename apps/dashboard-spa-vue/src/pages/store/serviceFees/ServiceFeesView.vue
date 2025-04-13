<script setup lang="ts">
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { ref, onMounted } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type ServiceFee } from '@lib/zod/serviceFee';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getJurisdictionSalesTaxRate } from '@lib/utils/sales_tax_rates';
import { ipwhois } from '@/ui-plus/geolocation-selection-map/ipwhois';

pageTitle.value = 'Service Fees'

const itemTotal = ref(100);
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
    ratePerOrder: 7, // readonly
    feePerOrder: 0, // readonly
});
const calculationType = ref<"ADD" | "INCLUDE">("INCLUDE");
const feeIncludedRateAsPercentage = ref(5);

const itemTax = () => {
    return calculateTax(itemTotal.value, taxSettings?.value?.taxRate ?? 0);
}

const applicationFee = function () {
    const platformFeePercent = itemTotal.value * ((platformServiceFee.value.ratePerOrder ?? 0) / 100);
    const platformFeeFixed = platformServiceFee.value.feePerOrder ?? 0;
    const partnerFeePercent = itemTotal.value * ((partnerServiceFee.value.ratePerOrder ?? 0) / 100);
    const partnerFeeFixed = partnerServiceFee.value.feePerOrder ?? 0;
    const marketingFeePercent = itemTotal.value * ((marketingPartner.value.ratePerOrder ?? 0) / 100);
    const marketingFeeFixed = marketingPartner.value.feePerOrder ?? 0;

    return platformFeePercent + platformFeeFixed + partnerFeePercent + partnerFeeFixed + marketingFeePercent + marketingFeeFixed;
}
const applicationFeeTax = () => {
    return calculateTax(applicationFee(), taxSettings?.value?.taxRate ?? 0);
}
const applicationFeeWithTaxesTotal = () => {
    return applicationFee() + applicationFeeTax();
}

const allowedFeeTotalIfIncluded = () => {
    return itemTotal.value * ((feeIncludedRateAsPercentage.value ?? 0) / 100);
}

const allowedFeeTotalIfIncludedTax = () => {
    return calculateTax(allowedFeeTotalIfIncluded(), taxSettings?.value?.taxRate ?? 0);
}

const allowedFeeTotalIfIncludedWithTaxes = () => {
    return allowedFeeTotalIfIncluded() + allowedFeeTotalIfIncludedTax();
}

const taxableAppliationFeeAmount = () => {
    if (calculationType.value === "INCLUDE") {
        const amount = applicationFee() - allowedFeeTotalIfIncluded()
        return amount > 0 ? amount : 0;
    } else {
        return applicationFee();
    }
}

const taxableAppliationFeeTax = () => {
    return calculateTax(taxableAppliationFeeAmount(), taxSettings?.value?.taxRate ?? 0);
}

const calculateTax = (total: number, taxRate: number) => {
    return total * ((taxRate ?? 0) / 100);
}

const buyerPaysTotalWithTaxes = () => {
    return itemTotal.value + itemTax() + taxableAppliationFeeAmount() + taxableAppliationFeeTax();
}

const storeReceivesTotalWithTaxes = () => {
    return buyerPaysTotalWithTaxes() - applicationFeeWithTaxesTotal();
}

const storeReceivesTotal = () => {
    return storeReceivesTotalWithTaxes() / (1 + (taxSettings?.value?.taxRate ?? 0) / 100);
}

const storeReceivesTotalTax = () => {
    return storeReceivesTotalWithTaxes() - storeReceivesTotal();
}

</script>

<template>
    <div class="max-w-lg mx-auto">
        <h1>Service Fees</h1>
        <div class="grid gap-4 py-4 border rounded-lg p-4 bg-card">
            <div class="">
                <div class="pt-4 border-t">
                    item(s): {{ itemTotal }} + taxes:{{ itemTax().toFixed(2) }}
                    + (service fees: {{ taxableAppliationFeeAmount().toFixed(2) }}
                    + tax:{{ taxableAppliationFeeTax().toFixed(2) }})
                    <br>
                    Buyer pays total: {{ buyerPaysTotalWithTaxes().toFixed(2) }}
                </div>
                <div class="pt-4 border-t">
                    Total application fees: {{ applicationFeeWithTaxesTotal().toFixed(2) }}
                    ({{ applicationFee().toFixed(2) }} + tax:{{ applicationFeeTax().toFixed(2) }})
                </div>
                <div class="pt-4 border-t">
                    <span>
                        Store: {{ storeReceivesTotalWithTaxes().toFixed(2) }}
                        ({{ storeReceivesTotal().toFixed(2) }} + tax:{{ storeReceivesTotalTax().toFixed(2) }})

                    </span>
                    <span v-if="calculationType === 'INCLUDE'">
                        <br>
                        Max: {{ allowedFeeTotalIfIncludedWithTaxes().toFixed(2) }}
                        ({{ allowedFeeTotalIfIncluded().toFixed(2) }} + tax:{{
                            allowedFeeTotalIfIncludedTax().toFixed(2) }})
                        <br>
                        (Max allowed deduction)
                    </span>
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
                       v-model="feeIncludedRateAsPercentage" />
            </div>

            <div class="grid grid-cols-4 items-center gap-4 pt-4 border-t">
                <Label class="text-right">
                    item(s)
                </Label>
                <Input type="number"
                       min="0"
                       step="1"
                       class="col-span-3"
                       v-model="itemTotal" />
            </div>

            <div class="border p-2 rounded-lg">
                <div class="font-medium">
                    Application fees details:
                </div>
                <!-- tax settings -->
                <div class="text-sm text-muted-foreground mb-4 pt-4 border-t"
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