<script setup lang="ts">
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { ref, onMounted, computed, watch } from 'vue';
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
    price: number;
    total: number;
    quantity: number;
    salesTax: number;
    salesTaxRate: number;
    discount: number;
}

const items = ref<CartItem[]>([
    { name: 'Item 1', price: 100, total: 0, quantity: 1, salesTax: 0, salesTaxRate: 0, discount: 0 },
]);

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

const stripeFees = ref<ServiceFee>({
    ratePerOrder: 1.5,
    feePerOrder: 0.20,
});

const stripeFeesTotal = computed(() => {
    // buyerPaysTotal (before stripe fees)
    const totalBeforeStripe = allItemsTotal.value +
        serviceFeeNeedToPayByBuyer.value -
        offerableDiscountAmount.value +
        taxesTotal.value;
    return ((totalBeforeStripe * 100) / (100 - (stripeFees.value.ratePerOrder ?? 0))) -
        totalBeforeStripe + (stripeFees.value.feePerOrder ?? 0)
});


const isLoading = ref(false);
const calculationType = ref<"ADD" | "INCLUDE">("INCLUDE");
const includedServiceFeeRate = ref(0);
const offerDiscountIfPossible = ref(false);

function addItem() {
    items.value.push({
        name: `Item ${items.value.length + 1}`,
        price: 0,
        total: 0,
        quantity: 1,
        salesTax: 0,
        salesTaxRate: 0,
        discount: 0
    });
}

function removeItem(index: number) {
    if (items.value.length > 1) {
        items.value.splice(index, 1);
    }
}

function updateItemTotal(item: CartItem) {
    item.total = item.price * item.quantity;
    updateItemTaxes();
}

onMounted(async () => {
    const ipWhoisResult = await ipwhois();
    taxSettings.value = getJurisdictionSalesTaxRate(ipWhoisResult.country_code ?? '', ipWhoisResult.region_code ?? '');
    // Initialize item totals based on price and quantity
    items.value.forEach(item => {
        updateItemTotal(item);
    });
    loadServiceFees();
    for (let i = 0; i < items.value.length; i++) {
        items.value[i].salesTaxRate = (taxSettings.value.taxRate ?? 0)
    }
    updateItemTaxes();
});

function updateItemTaxes() {
    if (!taxSettings.value) return;

    const discountedItems = itemsWithDiscounts.value;

    for (let i = 0; i < items.value.length; i++) {
        // const item = items.value[i];
        // const discountedItem = discountedItems[i];
        // item.discount = discountedItem.discount;
        // // Calculate tax using item-specific tax rate
        // const taxRate = item.salesTaxRate > 0 ? item.salesTaxRate : (taxSettings.value.taxRate ?? 0);
        // // item.salesTaxRate = (taxSettings.value.taxRate ?? 0)
        // item.salesTax = item.salesTaxRate / 100 * discountedItem.discountedTotal;
        const item = items.value[i];
        const discountedItem = discountedItems[i];
        item.discount = discountedItem.discount;
        // Calculate tax using item-specific tax rate
        // const taxRate = item.salesTaxRate > 0 ? item.salesTaxRate : (taxSettings.value.taxRate ?? 0);
        item.salesTax = item.salesTaxRate / 100 * discountedItem.discountedTotal;
    }
}

const allItemsTotal = computed(() => {
    return items.value.reduce((sum, item) => sum + item.total, 0);
});
const allItemsTaxes = computed(() => {
    return items.value.reduce((sum, item) => sum + item.salesTax, 0);
});

const platformServiceFeeTotal = computed(() => {
    return allItemsTotal.value * ((platformServiceFee.value.ratePerOrder ?? 0) / 100) + (platformServiceFee.value.feePerOrder ?? 0);
});
const partnerServiceFeeTotal = computed(() => {
    return allItemsTotal.value * ((partnerServiceFee.value.ratePerOrder ?? 0) / 100) + (partnerServiceFee.value.feePerOrder ?? 0);
});
const marketingPartnerServiceFeeTotal = computed(() => {
    return allItemsTotal.value * ((marketingPartner.value.ratePerOrder ?? 0) / 100) + (marketingPartner.value.feePerOrder ?? 0);
});

const totalServiceFeesTax = computed(() => {
    return (taxSettings.value?.taxRate ?? 0) / 100 * totalServiceFees.value;
});
const totalServiceFees = computed(() => {
    // const platformFeePercent = allItemsTotal.value * ((platformServiceFee.value.ratePerOrder ?? 0) / 100);
    // const platformFeeFixed = platformServiceFee.value.feePerOrder ?? 0;
    // const partnerFeePercent = allItemsTotal.value * ((partnerServiceFee.value.ratePerOrder ?? 0) / 100);
    // const partnerFeeFixed = partnerServiceFee.value.feePerOrder ?? 0;
    // const marketingFeePercent = allItemsTotal.value * ((marketingPartner.value.ratePerOrder ?? 0) / 100);
    // const marketingFeeFixed = marketingPartner.value.feePerOrder ?? 0;
    // return platformFeePercent + platformFeeFixed + partnerFeePercent + partnerFeeFixed + marketingFeePercent + marketingFeeFixed;
    return platformServiceFeeTotal.value +
        partnerServiceFeeTotal.value +
        marketingPartnerServiceFeeTotal.value;
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
    if (calculationType.value === "INCLUDE" && offerDiscountIfPossible.value) {
        const amount = allowedFeeTotalIfIncluded.value - totalServiceFees.value;
        const result = amount > 0 ? amount : 0;
        // Trigger tax recalculation when discount changes
        if (result > 0) {
            setTimeout(updateItemTaxes, 0);
        }
        return result;
    } else {
        return 0;
    }
});

const taxesTotal = computed(() => {
    return allItemsTaxes.value + serviceFeeTaxNeedToPayByBuyer.value;
});

const buyerPaysTotal = computed(() =>
    allItemsTotal.value + serviceFeeNeedToPayByBuyer.value - offerableDiscountAmount.value + taxesTotal.value + stripeFeesTotal.value
);

const storeReceivesTotal = computed(() =>
    allItemsTotal.value - offerableDiscountAmount.value - totalServiceFees.value +
    serviceFeeNeedToPayByBuyer.value
);

const storeReceivesTotalTax = computed(() =>
    taxesTotal.value - totalServiceFeesTax.value
);

// Add a computed property to distribute discounts among items
const itemsWithDiscounts = computed(() => {
    // Calculate the discount ratio for each item based on their price proportion
    const totalPrice = allItemsTotal.value;
    if (totalPrice === 0 || offerableDiscountAmount.value === 0) {
        return items.value.map(item => ({
            ...item,
            discount: 0,
            discountedTotal: item.total
        }));
    }

    return items.value.map(item => {
        // Calculate discount amount proportionally to item price
        const itemRatio = item.total / totalPrice;
        const itemDiscount = offerableDiscountAmount.value * itemRatio;
        const discountedTotal = item.total - itemDiscount;

        return {
            ...item,
            discount: itemDiscount,
            discountedTotal
        };
    });
});

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

// Also need to update based on calculation type changes
watch(calculationType, updateItemTaxes);
watch(includedServiceFeeRate, updateItemTaxes);
watch(offerDiscountIfPossible, updateItemTaxes);
</script>

<template>
    <div class="max-w-3xl mx-auto">
        <h1>Service Fees</h1>
        <div class="grid gap-4 py-4 border rounded-lg p-4 bg-card">
            <!-- Calculation Settings -->
            <div class="pt-4 border-t">
                <h3 class="font-medium">Calculation Settings</h3>
            </div>
            <div class="grid grid-cols-3 items-center gap-4">
                <Label class="text-right">
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
                <Switch :checked="offerDiscountIfPossible"
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


                <table class="w-full mt-4 text-right text-sm">
                    <thead>
                        <tr>
                            <th class="text-right border-t pt-2 font-medium">Item</th>
                            <th class="text-right border-t pt-2 font-medium">Unit Price</th>
                            <th class="text-right border-t pt-2 font-medium">Quantity</th>
                            <th class="text-right border-t pt-2 font-medium">Subtotal</th>
                            <th class="text-right border-t pt-2 font-medium">Tax Rate %</th>
                            <th class="text-right border-t pt-2 font-medium">Tax</th>
                            <th class="text-right border-t pt-2 font-medium">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Dynamic Items -->
                        <tr v-for="(item, index) in items"
                            :key="index">
                            <td class="border-t pt-2">{{ item.name }}</td>
                            <td class="text-right border-t pt-2">
                                <Input type="number"
                                       min="0"
                                       step="1"
                                       class="text-right"
                                       v-model="item.price"
                                       @update:modelValue="updateItemTotal(item)" />
                            </td>
                            <td class="text-right border-t pt-2">
                                <Input type="number"
                                       min="1"
                                       step="1"
                                       class="text-right"
                                       v-model="item.quantity"
                                       @update:modelValue="updateItemTotal(item)" />
                            </td>
                            <td class="text-right border-t pt-2">
                                {{ item.total.toFixed(2) }}
                                <div v-if="item.discount > 0"
                                     class="text-xs text-primary">
                                    -{{ item.discount.toFixed(2) }}
                                </div>
                            </td>
                            <td class="text-right border-t pt-2">
                                <Input type="number"
                                       min="0"
                                       step="1"
                                       class="text-right"
                                       v-model="item.salesTaxRate"
                                       @update:modelValue="updateItemTaxes()" />
                            </td>
                            <td class="text-right border-t pt-2">
                                {{ item.salesTax.toFixed(2) }}
                            </td>
                            <td class="text-right border-t pt-2">
                                {{ (item.total - item.discount + item.salesTax).toFixed(2) }}
                            </td>
                        </tr>

                        <!-- Service fees -->
                        <tr class="border-t pt-2">
                            <td class="">Service fees</td>
                            <td class="text-right "></td>
                            <td class="text-right "></td>
                            <td class="text-right ">
                                {{ serviceFeeNeedToPayByBuyer.toFixed(2) }}
                            </td>
                            <td class="text-right ">
                                {{ taxSettings?.taxRate ?? 0 }}
                            </td>
                            <td class="text-right ">
                                {{ serviceFeeTaxNeedToPayByBuyer.toFixed(2) }}
                            </td>
                            <td class="text-right ">
                                {{ (serviceFeeNeedToPayByBuyer + serviceFeeTaxNeedToPayByBuyer).toFixed(2) }}
                            </td>
                        </tr>

                        <!-- Subtotal - only shown if discount applies -->
                        <tr class="border-t pt-2">
                            <td class="font-medium">Subtotal</td>
                            <td class="text-right font-medium"></td>
                            <td class="text-right font-medium"></td>
                            <td class="text-right font-medium">
                                {{ (allItemsTotal + serviceFeeNeedToPayByBuyer).toFixed(2) }}
                            </td>
                            <td class="text-right font-medium"> </td>
                            <td class="text-right font-medium">
                                {{ (allItemsTaxes + serviceFeeTaxNeedToPayByBuyer).toFixed(2) }}
                            </td>
                            <td class="text-right font-medium">
                                {{ (allItemsTotal + allItemsTaxes + serviceFeeNeedToPayByBuyer + serviceFeeTaxNeedToPayByBuyer).toFixed(2) }}
                            </td>
                        </tr>

                        <!-- Discount -->
                        <tr class="border-t pt-2">
                            <td class="text-primary">Discount</td>
                            <td class="text-right text-primary"></td>
                            <td class="text-right text-primary"></td>
                            <td class="text-right text-primary"></td>
                            <td class="text-right text-primary"></td>
                            <td class="text-right text-primary"></td>
                            <td class="text-right text-primary">-{{ offerableDiscountAmount.toFixed(2) }}</td>
                        </tr>

                        <!-- Stripe -->
                        <tr>
                            <td class="font-bold border-t pt-2">Stripe</td>
                            <td class="text-right font-bold border-t pt-2"></td>
                            <td class="text-right font-bold border-t pt-2"></td>
                            <td class="text-right font-bold border-t pt-2">{{ stripeFeesTotal.toFixed(2) }}</td>
                            <td class="text-right font-bold border-t pt-2">0</td>
                            <td class="text-right font-bold border-t pt-2">0</td>
                            <td class="text-right font-bold border-t pt-2">{{ stripeFeesTotal.toFixed(2) }}
                            </td>
                        </tr>

                        <!-- Buyer pays total -->
                        <tr>
                            <td class="font-bold border-t pt-2">Buyer pays total</td>
                            <td class="text-right font-bold border-t pt-2"></td>
                            <td class="text-right font-bold border-t pt-2"></td>
                            <td class="text-right font-bold border-t pt-2"></td>
                            <td class="text-right font-bold border-t pt-2"></td>
                            <td class="text-right font-bold border-t pt-2"></td>
                            <td class="text-right font-bold border-t pt-2 text-2xl">{{ buyerPaysTotal.toFixed(2) }}</td>
                        </tr>

                        <!-- Total service fees -->
                        <tr>
                            <td class="border-t pt-2 text-sm">Total service fees</td>
                            <td class="text-right border-t pt-2 text-sm"></td>
                            <td class="text-right border-t pt-2 text-sm"></td>
                            <td class="text-right border-t pt-2 text-sm">{{ totalServiceFees.toFixed(2) }}</td>
                            <td class="text-right border-t pt-2 text-sm"></td>
                            <td class="text-right border-t pt-2 text-sm">{{ totalServiceFeesTax.toFixed(2) }}</td>
                            <td class="text-right border-t pt-2 text-sm">
                                {{ (totalServiceFees + totalServiceFeesTax).toFixed(2) }}
                            </td>
                        </tr>

                        <!-- Store receives -->
                        <tr>
                            <td class="font-bold border-t pt-2 text-sm">Store receives</td>
                            <td class="text-right font-bold border-t pt-2 text-sm"></td>
                            <td class="text-right font-bold border-t pt-2 text-sm"></td>
                            <td class="text-right font-bold border-t pt-2 text-sm">
                                {{ storeReceivesTotal.toFixed(2) }}
                            </td>
                            <td class="text-right font-bold border-t pt-2 text-sm"></td>
                            <td class="text-right font-bold border-t pt-2 text-sm">
                                {{ storeReceivesTotalTax.toFixed(2) }}
                            </td>
                            <td class="text-right font-bold border-t pt-2 text-sm">
                                {{ (storeReceivesTotal + storeReceivesTotalTax).toFixed(2) }}
                            </td>
                        </tr>
                    </tbody>
                </table>


            </div>


            <div class="border p-2 rounded-lg">
                <div class="font-medium">
                    Application fees details:
                </div>

                <!-- Platform Service Fee -->
                <div class="pt-4 border-t">
                    <h3 class="font-medium">Platform Service Fee
                        <span class="text-sm text-muted-foreground">
                            ({{ platformServiceFeeTotal.toFixed(2) }})
                        </span>
                    </h3>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">
                        Rate %
                    </Label>
                    <Input type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="platformServiceFee.ratePerOrder" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">
                        Fixed Fee
                    </Label>
                    <Input type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="platformServiceFee.feePerOrder" />
                </div>

                <!-- Partner Service Fee -->
                <div class="pt-4 border-t">
                    <h3 class="font-medium">Partner Service Fee
                        <span class="text-sm text-muted-foreground">
                            ({{ partnerServiceFeeTotal.toFixed(2) }})
                        </span>
                    </h3>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">
                        Rate %
                    </Label>
                    <Input type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="partnerServiceFee.ratePerOrder" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">
                        Fixed Fee
                    </Label>
                    <Input type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="partnerServiceFee.feePerOrder" />
                </div>

                <!-- Marketing Partner -->
                <div class="pt-4 border-t">
                    <h3 class="font-medium">
                        Marketing Partner
                        <span class="text-sm text-muted-foreground">
                            ({{ marketingPartnerServiceFeeTotal.toFixed(2) }})
                        </span>
                    </h3>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">
                        Rate %
                    </Label>
                    <Input type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="marketingPartner.ratePerOrder" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">
                        Fixed Fee
                    </Label>
                    <Input type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="marketingPartner.feePerOrder" />
                </div>

                <!-- Stripe -->
                <div class="pt-4 border-t">
                    <h3 class="font-medium">
                        Stripe
                        <span class="text-sm text-muted-foreground">
                            ({{ stripeFeesTotal.toFixed(2) }})
                        </span>
                    </h3>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">
                        Rate %
                    </Label>
                    <Input type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="stripeFees.ratePerOrder" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="text-right">
                        Fixed Fee
                    </Label>
                    <Input type="number"
                           min="0"
                           step="1"
                           class="col-span-3"
                           v-model="stripeFees.feePerOrder" />
                </div>
            </div>
        </div>
    </div>
</template>