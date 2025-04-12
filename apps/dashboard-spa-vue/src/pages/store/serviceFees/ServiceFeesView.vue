<script setup lang="ts">
/*/
You are expert at sales tax calculations, focus on sales taxes topic. 
please check web to verify my tax and service fee commission calculation.
Also please verify that there is no double taxation for buyer.
---
Terminology
stores/restaurants: business customers of this platform.
buyers: customers of the stores
Service fee rates: fee rates collected by platform for provided services per order as commission.
---
I am providing ordering website platform for stores/restaurants.
An e-commerce platform like Shopify or Squarespace.
This is a not marketplace. restaurants/stores will be the merchant on the bank records.
I will use stripe direct charges for online payments.
buyers directly transact with connected account, often unaware of my platform’s existence.
The transaction involves a single buyer and single store.
Stripe fees are debited from store's stipe accounts.

Some details provided by Stipe about direct charges:
```
Create a charge directly on a connected account. Customers are often unaware of your platform’s existence. You can add an application fee to the charge which is transferred to your platform’s account balance.

This charge type is best suited for platforms providing software as a service. For example, Shopify provides tools for building online storefronts, and Thinkific enables educators to sell online courses.

With this charge type:

You create a charge on your user’s account so the payment appears as a charge on the connected account, not in your account balance.
The connected account’s balance increases with every charge.
Funds always settle in the country of the connected account.
Your account balance increases with application fees from every charge.
The connected account’s balance is debited for refunds and chargebacks.
You can choose whether to have Stripe debit fees directly from connected accounts or from your platform account.
You can use Stripe Managed Risk if you meet these additional requirements.
```

https://docs.stripe.com/connect/direct-charges
https://docs.stripe.com/connect/direct-charges-fee-payer-behavior
https://docs.stripe.com/connect/direct-charge-buy-rate-reporting-overview
https://docs.stripe.com/connect/direct-charges-multiple-accounts
---
I need to add sales tax on top of my service fees. 
I will charge according to provided services.
-platfom: 1%
-support: 2%
-marketing: 7%
---
Sometimes they are included in menu prices with buffer rate.
Sometimes these service fees will be added on top of the order total(item total).
and sometimes both.
---
I am not sure about my sales tax calculation, if it is not correct, help me fix it.
If I add a service fee on top of subtotal:(item+tax), I also add sales tax for the service fee.
If I do not add a service fee on top, I do not add a second tax for buyer.
if both only difference for service fee is taxable for buyer, included part is taxed to store, not for buyer.
---
For example I am in Canada/Ontario 
and tax rate is 13%

here is required rates and values:
```
Tax settings: GST-HST: 13%
item(s): $100 (without tax)

Calculation Settings: Service fees included in item prices
Up to rate: 5% (service fee percentage allowed by store/restaurant)

Application fee rates
Platform Service Fee Rate: 1%
Support Partner Service Fee Rate: 2%
Marketing Partner Service Fee Rate: 7%
```

Calculation breakdown
```
item(s): $100 + taxes:$13.00 + (service fees: 5.00 + tax:0.65)
Buyer pays total: 118.65
Total application fees: 11.30 (10.00 + tax:1.30)
(5% allowed by store)  (we add 5% to cover rest of the fees, plus tax for rest)
for this order Store will receive: 107.35 (95.00 + tax:12.35)
Max: 5.65 (5.00 + tax:0.65) (Max allowed deduction: 5% + tax)
```
/*/

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