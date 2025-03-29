<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-vue-next';
import { apiClient } from '@api-client/index';
import { currentStoreId } from '@dashboard-spa-vue/stores/MyStoresStore';
import { toast } from '@/ui-plus/sonner';
import type { WeeklyHours } from '@lib/types/dateTimeType';
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import WeekEditor from './WeekEditor.vue';
import { Switch } from '@/components/ui/switch';
import { getCurrentTimeNow, isOpenNow } from '@lib/utils/isOpenNow';
import TimeZoneSelect from '@/ui-plus/TimeZoneSelect.vue';
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

onUnmounted(() => {
    if (interval) {
        clearInterval(interval);
    }
});

const timezone = ref<string | null>(Intl.DateTimeFormat().resolvedOptions().timeZone);

const isLoading = ref(false);
const defaultHours = ref<WeeklyHours>({
    isActive: true,
    days: JSON.parse(JSON.stringify(defaultDaysData))
});

const storeTimeNow = ref(getCurrentTimeNow(timezone.value));
const isNowOpen = ref(isOpenNow(timezone.value, defaultHours.value));
const interval: ReturnType<typeof setInterval> = setInterval(() => {
    storeTimeNow.value = getCurrentTimeNow(timezone.value);
    isNowOpen.value = isOpenNow(timezone.value, defaultHours.value);
}, 3000);

const deliveryHours = ref<WeeklyHours>({
    isActive: false,
    days: JSON.parse(JSON.stringify(defaultDaysData))
});

const pickupHours = ref<WeeklyHours>({
    isActive: false,
    days: JSON.parse(JSON.stringify(defaultDaysData))
});

let ignoreAutoSave = true;
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch([
    defaultHours,
    deliveryHours,
    pickupHours,
    timezone
], () => {
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
        const { data, error } = await (await apiClient.dashboard.store[':storeId'].open_hours.get.$post({
            param: {
                storeId: currentStoreId.value ?? '',
            },
            json: {
                columns: {
                    timezone: true,
                    defaultOpenHours: true,
                    deliveryHours: true,
                    pickupHours: true,
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
            timezone.value = data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        } else {
            defaultHours.value = { isActive: true, days: JSON.parse(JSON.stringify(defaultDaysData)) };
            deliveryHours.value = { isActive: false, days: JSON.parse(JSON.stringify(defaultDaysData)) };
            pickupHours.value = { isActive: false, days: JSON.parse(JSON.stringify(defaultDaysData)) };
            timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
            saveHours()
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
        const { error } = await (await apiClient.dashboard.store[':storeId'].open_hours.update.$patch({
            param: {
                storeId: currentStoreId.value ?? '',
            },
            json: {
                timezone: timezone.value,
                defaultOpenHours: defaultHours.value,
                deliveryHours: deliveryHours.value,
                pickupHours: pickupHours.value,
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
        <div>
            Store time zone:
            <TimeZoneSelect v-model="timezone" />
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Default Operating Hours</CardTitle>
                <CardDescription>Set your regular hours</CardDescription>
            </CardHeader>
            <CardContent class="p-2 pt-0">
                <div class="text-sm text-muted-foreground mb-4 border-b border-t py-4">
                    Time now: {{ storeTimeNow.toFormat('EEEE, HH:mm:ss') }}
                    <br>
                    Is open now: {{ isNowOpen }} {{ isNowOpen ? '✅' : '❌' }}
                </div>
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

        <Button @click="saveHours"
                :disabled="isLoading"
                class="w-full">
            <Loader2 v-if="isLoading"
                     class="mr-2 h-4 w-4 animate-spin" />
            Save Changes
        </Button>
    </div>
</template>