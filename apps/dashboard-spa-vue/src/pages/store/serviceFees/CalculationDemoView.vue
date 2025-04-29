<script setup lang="ts">
import { dashboardApiClient } from '@api-client/dashboard';
import { ResType } from '@api-client/typeUtils';
import type { OrderType } from '@lib/types/orderType';
import { ref, onMounted, computed } from 'vue';
import { currentStoreId } from '@dashboard-spa-vue/stores/MyStoresStore';
import { toast } from '@/ui-plus/sonner';
import { Button } from '@/components/ui/button';
import { calculateCartBreakdown } from '@lib/utils/calculateCartBreakdown';
import { calculateSubTotal } from '@lib/utils/calculateSubTotal';
import { inclusiveRate } from '@lib/utils/rateCalc';

const serviceFeesApiPath = dashboardApiClient.store[':storeId'].service_fees.get.$post;
type ServiceFees = ResType<typeof serviceFeesApiPath>["data"];

const taxSettingsApiPath = dashboardApiClient.store[':storeId'].tax_settings.get.$post;
type TaxSettings = ResType<typeof taxSettingsApiPath>["data"];

const props = defineProps<{
    serviceFees: ServiceFees;
}>();

const isLoading = ref(false);
const currentOrderType: OrderType = 'pickup';
const taxSettings = ref<TaxSettings>();
const totalWithTax = ref(100);

const tax = computed(() => {
    return;
})

const subTotal = computed<ReturnType<typeof calculateSubTotal>>(() => {
    const taxRate = taxSettings.value?.taxCategories?.[0]?.pickupRate ?? 0;
    const taxAmount = inclusiveRate(totalWithTax.value, taxRate);
    const itemTotal = totalWithTax.value - taxAmount;
    return {
        totalWithTax: totalWithTax.value,
        tax: taxAmount,
        itemTotal: totalWithTax.value - taxAmount,
        shownFee: taxSettings.value?.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ? itemTotal : totalWithTax.value,
        calculatedCustomServiceFees: [],
        bestDeliveryZone: null
    }
})

const cartBreakdown = computed(() => {
    return calculateCartBreakdown(
        subTotal.value,
        { ratePerOrder: 1, feePerOrder: 0 },
        { ratePerOrder: 2, feePerOrder: 0 },
        { ratePerOrder: 5, feePerOrder: 0 },
        taxSettings.value,
        props.serviceFees?.calculationType ?? 'INCLUDE',
        props.serviceFees?.tolerableServiceFeeRate ?? 0,
        props.serviceFees?.offerDiscountIfPossible ?? false,
        false,
        { name: 'Stripe Fee', ratePerOrder: 0, feePerOrder: 0, whoPaysFee: 'STORE' }
    )
})

onMounted(() => {
    loadTaxSettings();
})

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
        } else {
            toast.error('Failed to load tax settings');
        }
    }
    isLoading.value = false;
}
</script>

<template>
    <div>
        <pre>{{ cartBreakdown }}</pre>
    </div>
</template>