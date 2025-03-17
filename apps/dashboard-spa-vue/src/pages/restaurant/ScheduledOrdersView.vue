<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-vue-next';
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { currentRestaurantId } from '@src/stores/RestaurantStore';
import { toast } from '@/ui-plus/sonner';
import type { ScheduledOrdersSettings } from '@lib/types/restaurantTypes';
import { pageTitle } from '@src/stores/layout.store';

pageTitle.value = 'Scheduled Orders';

const isLoading = ref(false);
const isScheduledOrdersEnabled = ref(false);
const isOnlyScheduledOrdersAllowed = ref(false);

const pickupSettings = ref<Required<ScheduledOrdersSettings>>({
    min: { timeValue: 1, timeUnit: 'hours' },
    max: { timeValue: 4, timeUnit: 'days' },
    slot_interval: { timeValue: 15, timeUnit: 'minutes' }
});

const deliverySettings = ref<Required<ScheduledOrdersSettings>>({
    min: { timeValue: 1, timeUnit: 'hours' },
    max: { timeValue: 4, timeUnit: 'days' },
    slot_interval: { timeValue: 15, timeUnit: 'minutes' }
});

const loadData = async () => {
    isLoading.value = true;
    try {
        const { data, error } = await (await dashboardApiClient.api_dashboard.restaurant[':restaurantId'].scheduled_orders_settings.get.$post({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                columns: {
                    pickup_settings: true,
                    delivery_settings: true,
                    isScheduledOrdersEnabled: true,
                    isOnlyScheduledOrdersAllowed: true,
                }
            }
        })).json();

        if (error) {
            toast.error('Failed to load settings');
            return;
        }

        console.log('data', data);
        if (data) {
            isScheduledOrdersEnabled.value = data.isScheduledOrdersEnabled ?? false;
            isOnlyScheduledOrdersAllowed.value = data.isOnlyScheduledOrdersAllowed ?? false;
            pickupSettings.value = { ...pickupSettings.value, ...data.pickup_settings };
            deliverySettings.value = { ...deliverySettings.value, ...data.delivery_settings };
        }
    } catch (err) {
        console.error('Error loading settings:', err);
        toast.error('Failed to load settings');
    } finally {
        isLoading.value = false;
    }
};

const saveSettings = async () => {
    isLoading.value = true;
    try {
        const { error } = await (await dashboardApiClient.api_dashboard.restaurant[':restaurantId'].scheduled_orders_settings.update.$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                isScheduledOrdersEnabled: isScheduledOrdersEnabled.value,
                isOnlyScheduledOrdersAllowed: isOnlyScheduledOrdersAllowed.value,
                pickup_settings: pickupSettings.value,
                delivery_settings: deliverySettings.value,
            }
        })).json();

        if (error) {
            toast.error('Failed to save settings');
            return;
        }
        toast.success('Settings saved successfully');
    } catch (err) {
        console.error('Error saving settings:', err);
        toast.error('Failed to save settings');
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadData();
});

const timeUnits = [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
] as const;

</script>

<template>
    <div class="space-y-6 max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Scheduled Orders Settings</CardTitle>
                <CardDescription>Configure how customers can place orders in advance</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <!-- Enable/Disable Scheduled Orders -->
                <label for="enableScheduledOrders"
                       class="flex items-center justify-between space-x-2 cursor-pointer border rounded-lg p-4">
                    <div class="space-y-0.5">
                        <div class="text-base font-medium">Enable Scheduled Orders</div>
                        <p class="text-sm text-muted-foreground">Allow customers to schedule orders for later</p>
                    </div>
                    <Switch id="enableScheduledOrders"
                            :checked="isScheduledOrdersEnabled"
                            @update:checked="isScheduledOrdersEnabled = $event" />
                </label>



                <!-- Settings Accordion -->
                <div v-if="isScheduledOrdersEnabled"
                     class="space-y-4">
                    <!-- Pickup Settings -->
                    <h3 class="font-medium text-lg">Pickup Settings</h3>
                    <div class="space-y-4 p-4">
                        <!-- Minimum Time -->
                        <div class="grid gap-2">
                            <label class="text-sm font-medium">Minimum Time in Advance</label>
                            <div class="flex gap-2">
                                <Input type="number"
                                       v-model="pickupSettings.min.timeValue"
                                       class="w-24"
                                       min="1" />
                                <Select v-model="pickupSettings.min.timeUnit">
                                    <SelectTrigger class="w-32">
                                        <SelectValue :placeholder="pickupSettings.min.timeUnit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="unit in timeUnits"
                                                    :key="unit.value"
                                                    :value="unit.value">
                                            {{ unit.label }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <!-- Maximum Time -->
                        <div class="grid gap-2">
                            <label class="text-sm font-medium">Maximum Time in Advance</label>
                            <div class="flex gap-2">
                                <Input type="number"
                                       v-model="pickupSettings.max.timeValue"
                                       class="w-24"
                                       min="1" />
                                <Select v-model="pickupSettings.max.timeUnit">
                                    <SelectTrigger class="w-32">
                                        <SelectValue :placeholder="pickupSettings.max.timeUnit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="unit in timeUnits"
                                                    :key="unit.value"
                                                    :value="unit.value">
                                            {{ unit.label }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <!-- Time Slot Interval -->
                        <div class="grid gap-2">
                            <label class="text-sm font-medium">Time Slot Interval</label>
                            <div class="flex gap-2">
                                <Input type="number"
                                       v-model="pickupSettings.slot_interval.timeValue"
                                       class="w-24"
                                       min="1" />
                                <Select v-model="pickupSettings.slot_interval.timeUnit">
                                    <SelectTrigger class="w-32">
                                        <SelectValue :placeholder="pickupSettings.slot_interval.timeUnit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="unit in timeUnits"
                                                    :key="unit.value"
                                                    :value="unit.value">
                                            {{ unit.label }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div class="border-t "></div>
                    <h3 class="font-medium text-lg">Delivery Settings</h3>
                    <div class="space-y-4 p-4">
                        <!-- Minimum Time -->
                        <div class="grid gap-2">
                            <label class="text-sm font-medium">Minimum Time in Advance</label>
                            <div class="flex gap-2">
                                <Input type="number"
                                       v-model="deliverySettings.min.timeValue"
                                       class="w-24"
                                       min="1" />
                                <Select v-model="deliverySettings.min.timeUnit">
                                    <SelectTrigger class="w-32">
                                        <SelectValue :placeholder="deliverySettings.min.timeUnit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="unit in timeUnits"
                                                    :key="unit.value"
                                                    :value="unit.value">
                                            {{ unit.label }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <!-- Maximum Time -->
                        <div class="grid gap-2">
                            <label class="text-sm font-medium">Maximum Time in Advance</label>
                            <div class="flex gap-2">
                                <Input type="number"
                                       v-model="deliverySettings.max.timeValue"
                                       class="w-24"
                                       min="1" />
                                <Select v-model="deliverySettings.max.timeUnit">
                                    <SelectTrigger class="w-32">
                                        <SelectValue :placeholder="deliverySettings.max.timeUnit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="unit in timeUnits"
                                                    :key="unit.value"
                                                    :value="unit.value">
                                            {{ unit.label }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <!-- Time Slot Interval -->
                        <div class="grid gap-2">
                            <label class="text-sm font-medium">Time Slot Interval</label>
                            <div class="flex gap-2">
                                <Input type="number"
                                       v-model="deliverySettings.slot_interval.timeValue"
                                       class="w-24"
                                       min="1" />
                                <Select v-model="deliverySettings.slot_interval.timeUnit">
                                    <SelectTrigger class="w-32">
                                        <SelectValue :placeholder="deliverySettings.slot_interval.timeUnit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="unit in timeUnits"
                                                    :key="unit.value"
                                                    :value="unit.value">
                                            {{ unit.label }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <label for="onlyScheduledOrders"
                       class="flex items-center justify-between space-x-2 cursor-pointer border rounded-lg p-4"
                       v-if="isScheduledOrdersEnabled">
                    <div class="space-y-0.5">
                        <div class="text-base font-medium">Only Allow Scheduled Orders</div>
                        <p class="text-sm text-muted-foreground">Disables all ASAP orders</p>
                    </div>
                    <Switch id="onlyScheduledOrders"
                            :checked="isOnlyScheduledOrdersAllowed"
                            @update:checked="isOnlyScheduledOrdersAllowed = $event" />
                </label>
            </CardContent>
        </Card>

        <Button @click="saveSettings"
                :disabled="isLoading"
                class="w-full">
            <Loader2 v-if="isLoading"
                     class="mr-2 h-4 w-4 animate-spin" />
            Save Changes
        </Button>
    </div>
</template>