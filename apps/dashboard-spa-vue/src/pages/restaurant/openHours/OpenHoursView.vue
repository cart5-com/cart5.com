<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-vue-next';
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { currentRestaurantId } from '@src/stores/RestaurantStore';
import { toast } from '@/ui-plus/sonner';
import type { WeeklyHours } from '@lib/types/restaurantTypes';
import { pageTitle } from '@src/stores/layout.store';
import WeekEditor from './WeekEditor.vue';
import { Switch } from '@/components/ui/switch';
pageTitle.value = 'Operating Hours';

const defaultDaysData = {
    "0": { isOpen24: false, hours: [] },
    "1": { isOpen24: false, hours: [] },
    "2": { isOpen24: false, hours: [] },
    "3": { isOpen24: false, hours: [] },
    "4": { isOpen24: false, hours: [] },
    "5": { isOpen24: false, hours: [] },
    "6": { isOpen24: false, hours: [] },
}

const isLoading = ref(false);
const defaultHours = ref<WeeklyHours>({
    isActive: true,
    days: JSON.parse(JSON.stringify(defaultDaysData))
});

const deliveryHours = ref<WeeklyHours>({
    isActive: false,
    days: JSON.parse(JSON.stringify(defaultDaysData))
});

const pickupHours = ref<WeeklyHours>({
    isActive: false,
    days: JSON.parse(JSON.stringify(defaultDaysData))
});

const onPremiseHours = ref<WeeklyHours>({
    isActive: false,
    days: JSON.parse(JSON.stringify(defaultDaysData))
});

const tableReservationHours = ref<WeeklyHours>({
    isActive: false,
    days: JSON.parse(JSON.stringify(defaultDaysData))
});

let ignoreAutoSave = true;
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch([defaultHours, deliveryHours, pickupHours, onPremiseHours, tableReservationHours], () => {
    if (ignoreAutoSave) return;
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
        saveHours()
    }, 3000)
}, { deep: true, immediate: true })


const loadData = async () => {
    isLoading.value = true;
    try {
        const { data, error } = await (await dashboardApiClient.api_dashboard.restaurant[':restaurantId'].open_hours.get.$post({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                columns: {
                    defaultOpenHours: true,
                    deliveryHours: true,
                    pickupHours: true,
                    onPremiseHours: true,
                    tableReservationHours: true,
                }
            }
        })).json();

        if (error) {
            toast.error('Failed to load hours');
            return;
        }

        if (data) {
            defaultHours.value = data.defaultOpenHours || { isActive: true, days: defaultDaysData };
            deliveryHours.value = data.deliveryHours || { isActive: false, days: defaultDaysData };
            pickupHours.value = data.pickupHours || { isActive: false, days: defaultDaysData };
            onPremiseHours.value = data.onPremiseHours || { isActive: false, days: defaultDaysData };
            tableReservationHours.value = data.tableReservationHours || { isActive: false, days: defaultDaysData };
        } else {
            defaultHours.value = { isActive: true, days: JSON.parse(JSON.stringify(defaultDaysData)) };
            deliveryHours.value = { isActive: false, days: JSON.parse(JSON.stringify(defaultDaysData)) };
            pickupHours.value = { isActive: false, days: JSON.parse(JSON.stringify(defaultDaysData)) };
            onPremiseHours.value = { isActive: false, days: JSON.parse(JSON.stringify(defaultDaysData)) };
            tableReservationHours.value = { isActive: false, days: JSON.parse(JSON.stringify(defaultDaysData)) };
        }
    } catch (err) {
        console.error('Error loading hours:', err);
        toast.error('Failed to load hours');
    } finally {
        isLoading.value = false;
        setTimeout(() => {
            ignoreAutoSave = false;
        }, 1000)
    }
};

const saveHours = async () => {
    isLoading.value = true;
    try {
        const { error } = await (await dashboardApiClient.api_dashboard.restaurant[':restaurantId'].open_hours.update.$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                defaultOpenHours: defaultHours.value,
                deliveryHours: deliveryHours.value,
                pickupHours: pickupHours.value,
                onPremiseHours: onPremiseHours.value,
                tableReservationHours: tableReservationHours.value,
            }
        })).json();

        if (error) {
            toast.error('Failed to save hours');
            return;
        }
        toast.success('Hours saved successfully');
    } catch (err) {
        console.error('Error saving hours:', err);
        toast.error('Failed to save hours');
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadData();
});

const copyFromDefault = () => {
    deliveryHours.value = JSON.parse(JSON.stringify(defaultHours.value));
    deliveryHours.value.isActive = true;
    toast.success('Copied hours from default schedule');
};

const copyFromDefault2Pickup = () => {
    pickupHours.value = JSON.parse(JSON.stringify(defaultHours.value));
    pickupHours.value.isActive = true;
    toast.success('Copied hours from pickup schedule');
};

const copyFromDefault2OnPremise = () => {
    onPremiseHours.value = JSON.parse(JSON.stringify(defaultHours.value));
    onPremiseHours.value.isActive = true;
    toast.success('Copied hours from on-premise schedule');
};

const copyFromDefault2TableReservation = () => {
    tableReservationHours.value = JSON.parse(JSON.stringify(defaultHours.value));
    tableReservationHours.value.isActive = true;
    toast.success('Copied hours from table reservation schedule');
};

</script>

<template>
    <div class="space-y-16 max-w-sm mx-auto">
        <Button @click="saveHours"
                variant="outline"
                :disabled="isLoading">
            <Loader2 class="w-4 h-4 animate-spin"
                     v-if="isLoading" />Auto save
            <Check />
        </Button>
        <Card>
            <CardHeader>
                <CardTitle>Default Operating Hours</CardTitle>
                <CardDescription>Set your regular business hours</CardDescription>
            </CardHeader>
            <CardContent class="p-2 pt-0">
                <WeekEditor :weekHours="defaultHours" />
            </CardContent>
        </Card>



        <Card>
            <CardHeader>
                <CardTitle>
                    Delivery Hours
                </CardTitle>
                <CardDescription>
                    {{ deliveryHours.isActive ? '(Custom delivery hours)' : '(Uses same hours as default)' }}
                </CardDescription>
            </CardHeader>
            <CardContent class="p-2 pt-0">
                <div class="flex items-center space-x-2  mb-6 border-b pb-6">
                    <Switch id="deliveryHours"
                            :checked="deliveryHours.isActive"
                            @update:checked="deliveryHours.isActive = $event" />
                    <label for="deliveryHours"
                           class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Custom "Delivery Hours"
                    </label>
                </div>
                <Button class="mb-4"
                        variant="outline"
                        v-if="deliveryHours.isActive"
                        @click="copyFromDefault">
                    Copy from Default Hours
                </Button>
                <WeekEditor v-if="deliveryHours.isActive"
                            :weekHours="deliveryHours" />
            </CardContent>
        </Card>



        <Card>
            <CardHeader>
                <CardTitle>
                    Pickup Hours
                </CardTitle>
                <CardDescription>
                    {{ pickupHours.isActive ? '(Custom pickup hours)' : '(Uses same hours as default)' }}
                </CardDescription>
            </CardHeader>
            <CardContent class="p-2 pt-0">
                <div class="flex items-center space-x-2 mb-6 border-b pb-6">
                    <Switch id="pickupHours"
                            :checked="pickupHours.isActive"
                            @update:checked="pickupHours.isActive = $event" />
                    <label for="pickupHours"
                           class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Custom "Pickup Hours"
                    </label>
                </div>
                <Button class="mb-4"
                        variant="outline"
                        v-if="pickupHours.isActive"
                        @click="copyFromDefault2Pickup">
                    Copy from Default Hours
                </Button>

                <WeekEditor v-if="pickupHours.isActive"
                            :weekHours="pickupHours" />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>
                    On Premise Hours
                </CardTitle>
                <CardDescription>
                    {{ onPremiseHours.isActive ? '(Custom on-premise hours)' : '(Uses same hours as default)' }}
                </CardDescription>
            </CardHeader>
            <CardContent class="p-2 pt-0">
                <div class="flex items-center space-x-2 mb-6 border-b pb-6">
                    <Switch id="onPremiseHours"
                            :checked="onPremiseHours.isActive"
                            @update:checked="onPremiseHours.isActive = $event" />
                    <label for="onPremiseHours"
                           class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Custom "On Premise Hours"
                    </label>
                </div>
                <Button class="mb-4"
                        variant="outline"
                        v-if="onPremiseHours.isActive"
                        @click="copyFromDefault2OnPremise">
                    Copy from Default Hours
                </Button>
                <WeekEditor v-if="onPremiseHours.isActive"
                            :weekHours="onPremiseHours" />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>
                    Table Reservation Hours
                </CardTitle>
                <CardDescription>
                    {{ tableReservationHours.isActive ? '(Custom table reservation hours)' : '(Uses same hours as default)' }}
                </CardDescription>
            </CardHeader>
            <CardContent class="p-2 pt-0">
                <div class="flex items-center space-x-2 mb-6 border-b pb-6">
                    <Switch id="tableReservationHours"
                            :checked="tableReservationHours.isActive"
                            @update:checked="tableReservationHours.isActive = $event" />
                    <label for="tableReservationHours"
                           class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Custom "Table Reservation Hours"
                    </label>
                </div>
                <Button class="mb-4"
                        variant="outline"
                        v-if="tableReservationHours.isActive"
                        @click="copyFromDefault2TableReservation">
                    Copy from Default Hours
                </Button>
                <WeekEditor v-if="tableReservationHours.isActive"
                            :weekHours="tableReservationHours" />
            </CardContent>
        </Card>


        <Button @click="saveHours"
                :disabled="isLoading"
                class="w-full">
            <Loader2 v-if="isLoading"
                     class="mr-2 h-4 w-4 animate-spin" />
            Save Changes
        </Button>
    </div>
</template>