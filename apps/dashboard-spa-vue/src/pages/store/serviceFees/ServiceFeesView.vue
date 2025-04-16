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
import { PlusCircle, Trash2, Loader2 } from 'lucide-vue-next';
import { toast } from '@/ui-plus/sonner';
import { dashboardApiClient } from '@api-client/dashboard';
import type { ResType } from '@api-client/typeUtils';
import { currentStoreId } from '@dashboard-spa-vue/stores/MyStoresStore';
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { CALCULATION_TYPE } from '@lib/zod/serviceFee';
import { cleanEmptyProps } from '@lib/utils/cleanEmptyProps';

pageTitle.value = 'Service Fees';

const isLoading = ref(false);

const serviceFeesApiPath = dashboardApiClient.store[':storeId'].service_fees.get.$post;
type ServiceFees = ResType<typeof serviceFeesApiPath>["data"];

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
                    customServiceFees: true,
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
                tolerableServiceFeeRate: 0,
                offerDiscountIfPossible: false,
                customServiceFees: []
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
        const { error } = await (await dashboardApiClient.store[':storeId'].service_fees.update.$patch({
            param: {
                storeId: currentStoreId.value ?? '',
            },
            json: cleanEmptyProps({
                calculationType: serviceFees.value?.calculationType,
                tolerableServiceFeeRate: serviceFees.value?.tolerableServiceFeeRate,
                offerDiscountIfPossible: serviceFees.value?.offerDiscountIfPossible,
                customServiceFees: (serviceFees.value?.customServiceFees ?? [])
            })
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

const addServiceFee = () => {
    if (serviceFees.value && serviceFees.value.customServiceFees) {
        serviceFees.value.customServiceFees.push({
            id: crypto.randomUUID(),
            name: `Service Fee ${serviceFees.value.customServiceFees.length + 1}`,
            ratePerOrder: 0,
            feePerOrder: 0
        });
    }
};

const removeServiceFee = (index: number) => {
    if (serviceFees.value && serviceFees.value.customServiceFees) {
        serviceFees.value.customServiceFees.splice(index, 1);
    }
};
</script>

<template>
    <div class="max-w-md mx-auto space-y-6"
         v-if="serviceFees">
        <Card>
            <CardHeader>
                <CardTitle>Service Fees Settings</CardTitle>
                <CardDescription>Configure your store's service fees</CardDescription>
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
                                {{ type === 'INCLUDE' ? 'Include in Price' : 'Add to Price' }}
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
                               placeholder="30"
                               min="0"
                               :disabled="serviceFees.calculationType !== 'INCLUDE'"
                               max="100" />
                        <p class="text-xs text-muted-foreground">
                            The maximum service fee rate you're willing to accommodate.
                            <br />
                            <br />
                            <span class="font-bold">
                                Note:
                            </span>
                            If you sell on other platforms that charge fees, enter the highest fee percentage here.
                            This helps us understand how much you've already adjusted your prices.
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

                <!-- Custom Service Fees -->
                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <Label>Custom Service Fees</Label>
                        <Button variant="outline"
                                size="sm"
                                @click="addServiceFee">
                            <PlusCircle class="w-4 h-4 mr-2" />
                            Add Fee
                        </Button>
                    </div>

                    <div v-for="(fee, index) in serviceFees.customServiceFees"
                         :key="fee.id"
                         class="border p-4 rounded-lg space-y-4">
                        <div class="flex justify-between items-center">
                            <Input v-model="fee.name"
                                   placeholder="Service Fee Name" />
                            <Button variant="ghost"
                                    size="sm"
                                    @click="removeServiceFee(index)">
                                <Trash2 class="w-4 h-4" />
                            </Button>
                        </div>

                        <div class="grid gap-4">
                            <div class="space-y-2">
                                <Label>Rate Per Order (%)</Label>
                                <Input v-model="fee.ratePerOrder"
                                       type="number"
                                       step="0.1"
                                       min="0" />
                            </div>
                            <div class="space-y-2">
                                <Label>Fixed Fee Per Order</Label>
                                <Input v-model="fee.feePerOrder"
                                       type="number"
                                       step="0.01"
                                       min="0" />
                            </div>
                            <div class="space-y-2">
                                <Label>Custom Tax Rate (%)</Label>
                                <Input v-model="fee.overrideServiceFeeTaxRate"
                                       type="number"
                                       step="0.1"
                                       min="0" />
                                <p class="text-xs text-muted-foreground">
                                    {{
                                        !fee.overrideServiceFeeTaxRate ? '(default)' : `(custom:${fee.overrideServiceFeeTaxRate})`
                                    }}
                                    Optional: Override the default tax rate
                                    "Sidemenu" -> "Tax Settings" ->
                                    "Tax Rate for Service Fees(%)"
                                </p>
                            </div>
                        </div>
                    </div>
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