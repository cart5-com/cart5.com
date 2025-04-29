<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Info } from 'lucide-vue-next';
import { toast } from '@/ui-plus/sonner';
import { dashboardApiClient } from '@api-client/dashboard';
import type { ResType } from '@api-client/typeUtils';
import { currentStoreId } from '@dashboard-spa-vue/stores/MyStoresStore';
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { CALCULATION_TYPE } from '@lib/zod/serviceFee';
import CalculationDemoView from './CalculationDemoView.vue';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

pageTitle.value = 'Cart Calculation Settings';

const isLoading = ref(false);

const serviceFeesApiPath = dashboardApiClient.store[':storeId'].service_fees.get.$post;
type ServiceFees = Partial<ResType<typeof serviceFeesApiPath>["data"]>;

const serviceFees = ref<ServiceFees>();

onMounted(() => {
    loadData();
});

const loadData = async () => {
    isLoading.value = true;
    try {
        const { data, error } = await (await dashboardApiClient.store[':storeId'].service_fees.get.$post({
            param: {
                storeId: currentStoreId.value ?? '',
            },
            json: {
                columns: {
                    calculationType: true,
                    tolerableServiceFeeRate: true,
                    offerDiscountIfPossible: true,
                }
            }
        })).json();

        if (error) {
            toast.error('Failed to load service fees settings');
            return;
        }

        if (data) {
            serviceFees.value = data;
        } else {
            // Set default values if nothing exists
            serviceFees.value = {
                storeId: currentStoreId.value ?? '',
                calculationType: 'INCLUDE',
                tolerableServiceFeeRate: undefined,
                offerDiscountIfPossible: true,
            };
        }
    } catch (err) {
        console.error('Error loading service fees:', err);
        toast.error('Failed to load service fees settings');
    } finally {
        isLoading.value = false;
    }
};

const saveServiceFees = async () => {
    isLoading.value = true;
    try {
        // @ts-ignore
        if (serviceFees.value?.tolerableServiceFeeRate === '') {
            serviceFees.value.tolerableServiceFeeRate = null;
        }
        const { error } = await (await dashboardApiClient.store[':storeId'].service_fees.update.$patch({
            param: {
                storeId: currentStoreId.value ?? '',
            },
            json: {
                calculationType: serviceFees.value?.calculationType,
                tolerableServiceFeeRate: serviceFees.value?.tolerableServiceFeeRate ?? null,
                offerDiscountIfPossible: serviceFees.value?.offerDiscountIfPossible,
            }
        })).json();

        if (error) {
            toast.error('Failed to save service fees settings');
            return;
        }
        toast.success('Service fees settings saved successfully');
    } catch (err) {
        console.error('Error saving service fees settings:', err);
        toast.error('Failed to save service fees settings');
    } finally {
        isLoading.value = false;
    }
};

const isDemoVisible = ref(false);
</script>

<template>
    <div class="max-w-md mx-auto space-y-6"
         v-if="serviceFees">
        <Card>
            <CardHeader>
                <CardTitle>Cart Calculation Settings</CardTitle>
                <CardDescription>
                    <Popover>
                        <PopoverTrigger as-child>
                            <span class="cursor-pointer">
                                <Info class="inline-block mr-2" /> Read our advice
                            </span>
                        </PopoverTrigger>
                        <PopoverContent align="start">
                            <div class="space-y-8 max-h-[30vh] overflow-y-auto">
                                <p>
                                    <strong>Did you know?</strong> If you're selling on platforms like UberEats (30%
                                    commission) or
                                    DoorDash (25-30% commission), you've likely already adjusted your menu prices to
                                    account for
                                    these fees.
                                </p>
                                <p>
                                    Our platform's fees are significantly lower (typically 3-12%) and divided among the
                                    platform
                                    provider (1%), support partners (2-5%), and marketing partners (3-10%). By entering
                                    your current
                                    markup percentage below, you'll maintain the same net revenue while offering buyers
                                    substantially better prices.
                                </p>
                                <p>
                                    <strong>The Smart Approach:</strong> Enter the same percentage you use on other
                                    platforms (e.g.,
                                    30%) as your tolerable rate. This allows our system to automatically calculate
                                    optimal pricing
                                    that benefits everyone:
                                </p>
                                <ul class="list-disc pl-5 space-y-2">
                                    <li>You receive the exact same net revenue you're accustomed to</li>
                                    <li>Our platform fees are covered (typically just 3-8% total)</li>
                                    <li>The remaining difference becomes an automatic discount for buyers</li>
                                </ul>
                                <p>
                                    <strong>Enable the discount feature</strong> to increase your store's visibility in
                                    search
                                    results, attract more customers with competitive pricing, and drive higher order
                                    volume. Stores
                                    offering discounts typically see 30-40% more orders.
                                </p>
                                <p>
                                    Every order displays a complete breakdown of fees and taxes to buyers, creating
                                    unmatched
                                    transparency that builds customer trust and satisfaction.
                                </p>
                                <p>
                                    Try the calculator below to see exactly how different settings affect what buyers
                                    pay and what is your net revenue.
                                </p>
                            </div>
                        </PopoverContent>
                    </Popover>
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-12">

                <!-- Calculation Type -->
                <div class="space-y-2">
                    <Label>Calculation Type</Label>
                    <Select v-model="serviceFees.calculationType!">
                        <SelectTrigger>
                            <SelectValue placeholder="Select calculation type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="type in CALCULATION_TYPE"
                                        :key="type"
                                        :value="type">
                                {{ type === 'INCLUDE' ? 'My menu prices are able to cover some service fees' : 'Buyer pays all service fees' }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p class="text-xs text-muted-foreground">
                        Choose how service fees should be calculated for your orders.
                    </p>
                </div>

                <!-- Tolerable Service Fee Rate -->
                <div :class="{ 'opacity-50': serviceFees.calculationType !== 'INCLUDE' }">
                    <div class="space-y-2">
                        <Label>Tolerable Service Fee Rate (%)</Label>
                        <Input v-model="serviceFees.tolerableServiceFeeRate!"
                               type="number"
                               step="1"
                               placeholder="30? Enter the maximum rate you're willing to cover"
                               min="0"
                               :disabled="serviceFees.calculationType !== 'INCLUDE'"
                               max="100" />
                        <p class="text-xs text-muted-foreground">
                            <span v-if="serviceFees.tolerableServiceFeeRate">
                                20% ? - 30% ?
                                Enter the maximum rate you're willing to cover
                            </span>
                            <br />
                            <br />
                            <span class="font-bold">
                                Note:
                            </span>
                            If you sell on other platforms that charge fees, enter the highest fee percentage here.
                            This helps us understand how much you've already adjusted your prices.
                            <br />
                            <br />
                            For example, if you've increased your prices by 30% to cover fees on other platforms, enter
                            30
                            here.
                        </p>
                    </div>

                    <!-- Offer Discount If Possible -->
                    <div class="my-12">
                        <div class="flex items-center space-x-2 mt-4">
                            <Switch id="offerDiscount"
                                    :checked="serviceFees.offerDiscountIfPossible"
                                    @update:checked="(checked) => {
                                        if (serviceFees) {
                                            serviceFees.offerDiscountIfPossible = checked;
                                        }
                                    }"
                                    :disabled="serviceFees.calculationType !== 'INCLUDE'"
                                    class="" />
                            <Label for="offerDiscount">Offer discount if possible</Label>
                        </div>
                        <p class="text-xs text-muted-foreground">
                            If enabled,
                            you will offer a discount to buyers until to reach the tolerable service fee
                            rate after our service fee is applied.
                        </p>
                    </div>

                </div>

                <div class="border rounded-lg p-2">
                    <h1 class="text-lg font-bold cursor-pointer"
                        @click="isDemoVisible = !isDemoVisible">
                        <Info class="inline-block mr-2" />
                        Try in action
                    </h1>
                    <CalculationDemoView :serviceFees="serviceFees"
                                         v-if="isDemoVisible" />
                </div>

                <Button @click="saveServiceFees"
                        :disabled="isLoading"
                        class="w-full">
                    <Loader2 v-if="isLoading"
                             class="animate-spin mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </CardContent>
        </Card>

    </div>
</template>