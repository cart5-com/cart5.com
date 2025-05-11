<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Loader2 } from 'lucide-vue-next';
import { toast } from '@/ui-plus/sonner';
import { dashboardApiClient } from '@api-client/dashboard';
import type { ResType } from '@api-client/typeUtils';
import { currentStoreId } from '@dashboard-spa-vue/stores/MyStoresStore';
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { cleanEmptyProps } from '@lib/utils/cleanEmptyProps';

pageTitle.value = 'Service Fees';

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
        setTimeout(() => {
            const inputs = document.querySelectorAll('.service-name-input');
            if (inputs.length > 0) {
                const lastInput = inputs[inputs.length - 1];
                lastInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 1000);
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
                <CardTitle>Custom Service Fees</CardTitle>
            </CardHeader>
            <CardContent class="space-y-12">

                <!-- Custom Service Fees -->
                <div class="space-y-4">
                    <Button variant="outline"
                            size="sm"
                            class="w-full"
                            @click="addServiceFee">
                        <PlusCircle class="w-4 h-4 mr-2" />
                        Add New
                    </Button>

                    <div v-for="(fee, index) in serviceFees.customServiceFees"
                         :key="fee.id"
                         class="border p-4 rounded-lg space-y-4">
                        <div class="flex justify-between items-center">
                            <Input v-model="fee.name"
                                   class="service-name-input"
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
                                        !fee.overrideServiceFeeTaxRate ? '(uses default)' : `(uses custom:${fee.overrideServiceFeeTaxRate})`
                                    }}
                                    Optional: Please enter to override the default Service fee tax rate
                                    ("Sidemenu" -> "Tax Settings" ->
                                    "Tax Rate for Service Fees(%)")
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button variant="outline"
                            size="sm"
                            class="w-full"
                            v-if="serviceFees?.customServiceFees?.length && serviceFees.customServiceFees.length > 2"
                            @click="addServiceFee">
                        <PlusCircle class="w-4 h-4 mr-2" />
                        Add New
                    </Button>
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