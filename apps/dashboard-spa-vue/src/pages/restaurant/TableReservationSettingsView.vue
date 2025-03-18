<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-vue-next';
import { toast } from '@/ui-plus/sonner';
import { apiClient } from '@api-client/index';
import { currentRestaurantId } from '@src/stores/RestaurantStore';
import { pageTitle } from '@src/stores/layout.store';

pageTitle.value = 'Table Reservation Settings';

const isLoading = ref(false);
const isTableReservationEnabled = ref(false);

const defaultSettings = {
    minGuests: 2,
    maxGuests: 8,
    minTimeInAdvanceMinutes: 15,
    maxTimeInAdvanceDays: 8,
    lateHoldTimeMinutes: 15,
    allowPreOrder: false
};

const settings = ref<typeof defaultSettings>(JSON.parse(JSON.stringify(defaultSettings)));

const loadData = async () => {
    isLoading.value = true;
    try {
        // TODO: is there a way to get all the data in one request?
        const { data, error } = await (await apiClient.dashboard.restaurant[':restaurantId'].table_reservation_settings.get.$post({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                columns: {
                    minGuests: true,
                    maxGuests: true,
                    minTimeInAdvanceMinutes: true,
                    maxTimeInAdvanceDays: true,
                    lateHoldTimeMinutes: true,
                    allowPreOrder: true
                }
            }
        })).json();
        // get offersTableReservation from restaurant
        const { data: offersTableReservation, error: offersTableReservationError } = await (await apiClient.dashboard.restaurant[':restaurantId'].$post({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                columns: {
                    offersTableReservation: true,
                }
            }
        })).json();

        if (error || offersTableReservationError) {
            toast.error('Failed to load settings');
            return;
        }

        if (data) {
            settings.value = {
                minGuests: data.minGuests ?? defaultSettings.minGuests,
                maxGuests: data.maxGuests ?? defaultSettings.maxGuests,
                minTimeInAdvanceMinutes: data.minTimeInAdvanceMinutes ?? defaultSettings.minTimeInAdvanceMinutes,
                maxTimeInAdvanceDays: data.maxTimeInAdvanceDays ?? defaultSettings.maxTimeInAdvanceDays,
                lateHoldTimeMinutes: data.lateHoldTimeMinutes ?? defaultSettings.lateHoldTimeMinutes,
                allowPreOrder: data.allowPreOrder ?? defaultSettings.allowPreOrder
            }
        }
        isTableReservationEnabled.value = offersTableReservation?.offersTableReservation ?? false;
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
        const { error } = await (await apiClient.dashboard.restaurant[':restaurantId'].table_reservation_settings.update.$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                minGuests: settings.value.minGuests,
                maxGuests: settings.value.maxGuests,
                minTimeInAdvanceMinutes: settings.value.minTimeInAdvanceMinutes,
                maxTimeInAdvanceDays: settings.value.maxTimeInAdvanceDays,
                lateHoldTimeMinutes: settings.value.lateHoldTimeMinutes,
                allowPreOrder: settings.value.allowPreOrder
            }
        })).json();
        // update offersTableReservation: isTableReservationEnabled.value,
        const { error: offersTableReservationError } = await (await apiClient.dashboard.restaurant[':restaurantId'].$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                offersTableReservation: isTableReservationEnabled.value,
            }
        })).json();

        if (error || offersTableReservationError) {
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
</script>

<template>
    <div class="max-w-md mx-auto space-y-6">
        <label for="offersTableReservation"
               class="flex items-center justify-between p-4 border rounded-lg cursor-pointer max-w-sm mx-auto">
            <div class="space-y-0.5">
                <h3 class="text-lg font-medium">Table Reservation</h3>
                <p class="text-muted-foreground">Do you offer table reservation?</p>
            </div>
            <div class="flex items-center space-x-3">
                <Switch id="offersTableReservation"
                        :checked="isTableReservationEnabled"
                        @update:checked="(checked: boolean) => isTableReservationEnabled = checked"
                        :disabled="isLoading"
                        class="scale-125">
                </Switch>
                <span class="font-medium">{{ isTableReservationEnabled ? 'Yes' : 'No' }}</span>
            </div>
        </label>
        <Card v-if="isTableReservationEnabled">
            <CardHeader>
                <CardTitle>Table Reservation Settings</CardTitle>
                <CardDescription>Configure how customers can make table reservations</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <!-- Guest Limits -->
                <div class="space-y-2">
                    <Label>Minimum Guests</Label>
                    <Input v-model="settings.minGuests"
                           type="number"
                           min="1" />
                </div>
                <div class="space-y-2">
                    <Label>Maximum Guests</Label>
                    <Input v-model="settings.maxGuests"
                           type="number"
                           min="1" />
                </div>

                <!-- Time Settings -->
                <div class="space-y-2">
                    <Label>Minimum Time in Advance (minutes)</Label>
                    <Input v-model="settings.minTimeInAdvanceMinutes"
                           type="number"
                           min="0" />
                    <p class="text-sm text-muted-foreground">
                        How far in advance customers must book (e.g., 60 minutes)
                    </p>
                </div>

                <div class="space-y-2">
                    <Label>Maximum Time in Advance (days)</Label>
                    <Input v-model="settings.maxTimeInAdvanceDays"
                           type="number"
                           min="1" />
                    <p class="text-sm text-muted-foreground">
                        How far in the future customers can book (e.g., 30 days)
                    </p>
                </div>

                <div class="space-y-2">
                    <Label>Late Hold Time (minutes)</Label>
                    <Input v-model="settings.lateHoldTimeMinutes"
                           type="number"
                           min="0" />
                    <p class="text-sm text-muted-foreground">
                        How long to hold a table if guests are late
                    </p>
                </div>

                <!-- Pre-order Toggle -->
                <div class="flex items-center justify-between space-x-2">
                    <div class="space-y-0.5">
                        <Label>Allow Pre-ordering</Label>
                        <p class="text-sm text-muted-foreground">
                            Let customers order their meals when making a reservation
                        </p>
                    </div>
                    <Switch :checked="settings.allowPreOrder"
                            @update:checked="(checked: boolean) => settings.allowPreOrder = checked" />
                </div>

                <Button @click="saveSettings"
                        :disabled="isLoading"
                        class="w-full">
                    <Loader2 v-if="isLoading"
                             class="mr-2 h-4 w-4 animate-spin" />
                    Save Changes
                </Button>
            </CardContent>
        </Card>
    </div>
</template>