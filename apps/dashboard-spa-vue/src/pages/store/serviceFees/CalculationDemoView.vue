<script setup lang="ts">
import { dashboardApiClient } from '@api-client/dashboard';
import { ResType } from '@api-client/typeUtils';
import { ref, onMounted, computed } from 'vue';
import { currentStoreId } from '@dashboard-spa-vue/stores/MyStoresStore';
import { toast } from '@/ui-plus/sonner';
import { calculateCartBreakdown } from '@lib/utils/calculateCartBreakdown';
import { calculateSubTotal } from '@lib/utils/calculateSubTotal';
import { inclusiveRate } from '@lib/utils/rateCalc';
import type { TaxSettings as LibTaxSettings } from '@lib/zod/taxSchema';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Info } from 'lucide-vue-next';
import type { OrderType } from '@lib/types/orderType';
import { Button } from '@/components/ui/button';
import type { ServiceFee } from "@lib/zod/serviceFee";

const serviceFeesApiPath = dashboardApiClient.store[':storeId'].service_fees.get.$post;
type ServiceFees = Partial<ResType<typeof serviceFeesApiPath>["data"]>;

const taxSettingsApiPath = dashboardApiClient.store[':storeId'].tax_settings.get.$post;
type TaxSettings = ResType<typeof taxSettingsApiPath>["data"];

const props = defineProps<{
    serviceFees: ServiceFees;
}>();

const isLoading = ref(false);
const taxSettings = ref<TaxSettings>();
const subtotalWithTax = ref(100);
const currentOrderType = ref<OrderType>('delivery');

const taxRate = computed(() => {
    return currentOrderType.value === 'delivery' ? taxSettings.value?.taxCategories?.[0]?.deliveryRate ?? 0 : taxSettings.value?.taxCategories?.[0]?.pickupRate ?? 0;
})

const subTotal = computed<ReturnType<typeof calculateSubTotal>>(() => {
    const tax = inclusiveRate(subtotalWithTax.value, taxRate.value);
    const itemTotal = subtotalWithTax.value - tax;
    const shownFee = taxSettings.value?.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ? itemTotal : subtotalWithTax.value;
    return {
        totalWithTax: subtotalWithTax.value,
        tax,
        itemTotal,
        shownFee,
        calculatedCustomServiceFees: [],
        bestDeliveryZone: null
    }
})

const platformServiceFee = ref<ServiceFee>({ ratePerOrder: 1, feePerOrder: 0 });
const supportPartnerServiceFee = ref<{
    ratePerOrder?: number | undefined;
    feePerOrder?: number | undefined;
} | null>({
    ratePerOrder: 2,
    feePerOrder: 0
});
const marketingPartnerServiceFee = ref<ServiceFee>({ ratePerOrder: 5, feePerOrder: 0 });

const cartBreakdown = computed(() => {
    // Create a properly typed tax settings object for the cart calculation
    const taxSettingsForCalc: LibTaxSettings = {
        currency: taxSettings.value?.currency || undefined,
        currencySymbol: taxSettings.value?.currencySymbol || undefined,
        salesTaxType: taxSettings.value?.salesTaxType || undefined,
        taxName: taxSettings.value?.taxName || undefined,
        taxRateForDelivery: taxSettings.value?.taxRateForDelivery || undefined,
        taxRateForServiceFees: taxSettings.value?.taxRateForServiceFees || undefined,
        taxCategories: taxSettings.value?.taxCategories || undefined
    };

    return calculateCartBreakdown(
        subTotal.value,
        platformServiceFee.value,
        supportPartnerServiceFee.value,
        marketingPartnerServiceFee.value,
        taxSettingsForCalc,
        props.serviceFees?.calculationType ?? 'INCLUDE',
        props.serviceFees?.tolerableServiceFeeRate ?? 0,
        props.serviceFees?.offerDiscountIfPossible ?? false,
        false,
        { name: 'Stripe Fee', ratePerOrder: 0, feePerOrder: 0, whoPaysFee: 'STORE' }
    )
})

onMounted(() => {
    loadTaxSettings();
    loadSupportPartnerServiceFee();
})

const loadSupportPartnerServiceFee = async () => {
    const { data, error } = await (await dashboardApiClient.store[':storeId'].support_partner_fees.$get({
        param: {
            storeId: currentStoreId.value ?? '',
        },
    })).json();

    if (error) {
        toast.error('Failed to load support partner service fee');
    } else {
        supportPartnerServiceFee.value = data;
    }
}

const loadTaxSettings = async () => {
    isLoading.value = true;
    const { data, error } = await (await dashboardApiClient.store[':storeId'].tax_settings.get.$post({
        param: {
            storeId: currentStoreId.value ?? '',
        },
        json: {
            columns: {
                taxCategories: true,
                currency: true,
                currencySymbol: true,
                salesTaxType: true,
                taxName: true,
                taxRateForDelivery: true,
                taxRateForServiceFees: true,
            }
        }
    })).json();

    if (error) {
        toast.error('Failed to load tax settings');
    } else {
        if (data) {
            taxSettings.value = data;
            subtotalWithTax.value = parseFloat((100 * (1 + taxRate.value / 100)).toFixed(2));
        } else {
            toast.error('Failed to load tax settings');
        }
    }
    isLoading.value = false;
}


</script>

<template>
    <div>
        This is a calculation demo,
        if you change any amount in the input fields above or below, the cart breakdown will update
        automatically.
        <div class="bg-muted text-muted-foreground my-4  w-fit flex items-center justify-center rounded-lg p-1">
            <Button variant="ghost"
                    @click="currentOrderType = 'delivery'"
                    :class="currentOrderType === 'delivery' ? 'bg-background text-foreground shadow hover:bg-background/80' : ''">
                Delivery
            </Button>
            <Button variant="ghost"
                    @click="currentOrderType = 'pickup'"
                    :class="currentOrderType === 'pickup' ? 'bg-background text-foreground shadow hover:bg-background/80' : ''">
                Pickup
            </Button>
        </div>
        <div>
            <div class="text-sm text-muted-foreground">
                (used tax rate: {{ taxRate }}% according to your tax settings)
                <br>
                A buyer is about to place an order.
                <br>
                <br>
                Subtotal={{ subtotalWithTax }}
                <br>
                All items fees in the cart +
                <br>
                {{ currentOrderType === 'delivery' ? 'delivery fees +' : '' }}
                <br v-if="currentOrderType === 'delivery'">
                your custom service fees +
                <br>
                and taxes
                <br>
                <br>
            </div>
        </div>
        <div class="flex justify-between items-center border-t py-2 border-foreground">
            <span class="">
                Subtotal
            </span>
            <span class=" text-right">
                <Input v-model="subtotalWithTax"
                       type="number"
                       class="text-right max-w-24" />
            </span>
        </div>
        <div class="flex justify-between items-center border-t py-2 border-foreground"
             v-if="cartBreakdown.buyerPaysTaxAndFeesShownFee > 0">
            <span class="">
                {{ cartBreakdown.buyerPaysTaxAndFeesName }}

                <Popover>
                    <PopoverTrigger as-child>
                        <Info class="inline-block ml-2" />
                    </PopoverTrigger>
                    <PopoverContent align="start">
                        <div class="space-y-2">
                            <h3 class="font-semibold">What's included?</h3>
                            <div v-for="(fee, index) in cartBreakdown.buyerPaysTaxAndFees"
                                 :key="index">
                                <div class="flex justify-between items-center">
                                    <div class="font-medium">{{ fee.name }}</div>
                                    <div>{{ fee.currencyShownFee }}</div>
                                </div>
                                <div class="text-sm text-muted-foreground">{{ fee.note }}</div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

            </span>
            <span class=" text-right">
                {{ taxSettings?.currencySymbol }}{{ cartBreakdown.buyerPaysTaxAndFeesShownFee }}
            </span>
        </div>

        <div class="flex justify-between items-center p-2 text-xl font-bold text-primary"
             v-if="cartBreakdown.discount > 0">
            <span class="">
                Discount
            </span>
            <span class=" text-right">
                -{{ taxSettings?.currencySymbol }}{{ cartBreakdown.discount }}
            </span>
        </div>

        <div class="flex justify-between items-center font-bold text-3xl py-8 border-t border-foreground">
            <span>
                Buyer pays total
            </span>
            <span class="text-right">
                {{ taxSettings?.currencySymbol }}{{ cartBreakdown.buyerPays }}
            </span>
        </div>
        <div class="space-y-2 border-t py-4 border-foreground">
            <h3 class="font-semibold ">Transparency breakdown</h3>
            <div v-if="cartBreakdown.allTransparencyBreakdown">
                <div v-for="(fee, index) in cartBreakdown.allTransparencyBreakdown"
                     :key="index"
                     class="my-4">
                    <div class="flex justify-between items-center">
                        <div class="font-medium">
                            {{ fee.name }}
                        </div>
                        <div>
                            {{ fee.currencyShownFee }}
                        </div>
                    </div>
                    <div class="text-sm text-muted-foreground">
                        {{ fee.note }}
                    </div>
                </div>
            </div>
        </div>
        <div class="flex justify-between items-center border-t py-2 border-foreground">
            <span class="">
                Platform service fee %
                <br>
                (real value)
            </span>
            <span class=" text-right">
                <Input v-model="platformServiceFee.ratePerOrder"
                       type="number"
                       class="text-right max-w-24" />
            </span>
        </div>
        <div class="flex justify-between items-center border-t py-2 border-foreground">
            <span class="">
                Support partner service fee %
                <br>
                (real value)
            </span>
            <span class=" text-right">
                <Input v-if="supportPartnerServiceFee"
                       v-model="supportPartnerServiceFee.ratePerOrder"
                       type="number"
                       class="text-right max-w-24" />
            </span>
        </div>
        <div class="flex justify-between items-center border-t py-2 border-foreground">
            <span class="">
                Marketing partner service fee %
                <br>
                (not a real value, this may vary according to the marketing channel)
            </span>
            <span class=" text-right">
                <Input v-model="marketingPartnerServiceFee.ratePerOrder"
                       type="number"
                       class="text-right max-w-24" />
            </span>
        </div>
        <!-- <pre>{{ cartBreakdown }}</pre> -->
    </div>
</template>