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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ScheduledOrdersSettings } from 'lib/types/restaurantTypes';
import { pageTitle } from '@src/stores/layout.store';

pageTitle.value = 'Scheduled Orders';

const isLoading = ref(false);
const isScheduledOrdersEnabled = ref(false);
const isOnlyScheduledOrdersAllowed = ref(false);

const pickupSettings = ref<ScheduledOrdersSettings>({
    min: { timeValue: 1, timeUnit: 'hours' },
    max: { timeValue: 4, timeUnit: 'days' },
    slot_interval: { timeValue: 15, timeUnit: 'minutes' }
});

const deliverySettings = ref<ScheduledOrdersSettings>({
    min: { timeValue: 1, timeUnit: 'hours' },
    max: { timeValue: 4, timeUnit: 'days' },
    slot_interval: { timeValue: 15, timeUnit: 'minutes' }
});

const loadData = async () => {
    isLoading.value = true;
    try {
        const { data, error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$post({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                columns: {
                    scheduledOrdersSettings: {
                        pickup_settings: true,
                        delivery_settings: true,
                        isScheduledOrdersEnabled: true,
                        isOnlyScheduledOrdersAllowed: true,
                    }
                }
            }
        })).json();

        if (error) {
            toast.error('Failed to load settings');
            return;
        }

        console.log('data', data);
        if (data?.scheduledOrdersSettings) {
            isScheduledOrdersEnabled.value = data.scheduledOrdersSettings.isScheduledOrdersEnabled ?? false;
            isOnlyScheduledOrdersAllowed.value = data.scheduledOrdersSettings.isOnlyScheduledOrdersAllowed ?? false;
            pickupSettings.value = data.scheduledOrdersSettings.pickup_settings ?? pickupSettings.value;
            deliverySettings.value = data.scheduledOrdersSettings.delivery_settings ?? deliverySettings.value;
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
        const { error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                scheduledOrdersSettings: {
                    isScheduledOrdersEnabled: isScheduledOrdersEnabled.value,
                    isOnlyScheduledOrdersAllowed: isOnlyScheduledOrdersAllowed.value,
                    pickup_settings: pickupSettings.value,
                    delivery_settings: deliverySettings.value,
                }
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
                <div class="flex items-center justify-between space-x-2">
                    <div class="space-y-0.5">
                        <label class="text-base font-medium">Enable Scheduled Orders</label>
                        <p class="text-sm text-muted-foreground">Allow customers to schedule orders for later</p>
                    </div>
                    <Switch :checked="isScheduledOrdersEnabled"
                            @update:checked="isScheduledOrdersEnabled = $event" />
                </div>



                <!-- Settings Accordion -->
                <Accordion v-if="isScheduledOrdersEnabled"
                           type="multiple"
                           collapsible>
                    <!-- Pickup Settings -->
                    <AccordionItem value="pickup">
                        <AccordionTrigger>
                            <h3 class="font-medium text-lg">Pickup Settings</h3>
                        </AccordionTrigger>
                        <AccordionContent>
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
                        </AccordionContent>
                    </AccordionItem>

                    <!-- Delivery Settings -->
                    <AccordionItem value="delivery">
                        <AccordionTrigger>
                            <h3 class="font-medium text-lg">Delivery Settings</h3>
                        </AccordionTrigger>
                        <AccordionContent>
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
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>


                <div class="flex items-center justify-between space-x-2"
                     v-if="isScheduledOrdersEnabled">
                    <div class="space-y-0.5">
                        <label class="text-base font-medium">Only Allow Scheduled Orders</label>
                        <p class="text-sm text-muted-foreground">Disables all ASAP orders</p>
                    </div>
                    <Switch :checked="isOnlyScheduledOrdersAllowed"
                            @update:checked="isOnlyScheduledOrdersAllowed = $event" />
                </div>
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