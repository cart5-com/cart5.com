<script setup lang="ts">
import GoogleMapsEditor from './GoogleMapsEditor.vue'
import ZoneCard from './ZoneCard.vue'
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from '@/ui-plus/sonner';
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { currentRestaurantId } from '@src/stores/RestaurantStore';
import { DeliveryZone } from 'lib/types/restaurantTypes';
import { Check, Loader2, Plus } from 'lucide-vue-next';
import { onMounted, ref, watch } from 'vue';
import { pageTitle } from '@src/stores/layout.store';
import { useRouter } from 'vue-router';
const router = useRouter();

const mapComp = ref<InstanceType<typeof GoogleMapsEditor>>();
let restaurantLocation: { lat: number, lng: number };
const isDialogOpen = ref(false)
const isAlertDialogOpen = ref(false)
const selectedZone = ref<DeliveryZone | null>(null)
const zoneToDelete = ref<DeliveryZone | null>(null)
const isLoading = ref(false);
const deliveryZones = ref<DeliveryZone[]>([])

let ignoreAutoSave = true;
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(deliveryZones, () => {
    if (ignoreAutoSave) return;
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
        saveDeliveryZones()
    }, 3000)
}, { deep: true, immediate: true })

pageTitle.value = 'Delivery Options'

// Load delivery zones from API
const loadDeliveryZones = async () => {
    isLoading.value = true;
    try {
        const { data, error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$post({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                columns: {
                    address: {
                        lat: true,
                        lng: true,
                    },
                    deliveryZones: {
                        zones: true
                    }
                },
            }
        })).json();

        if (error) {
            toast.error('Failed to load delivery zones');
            return;
        }
        restaurantLocation = {
            lat: data?.address?.lat ?? 0,
            lng: data?.address?.lng ?? 0,
        }
        deliveryZones.value = data?.deliveryZones?.zones ?? [];
        if (restaurantLocation.lat === 0 && restaurantLocation.lng === 0) {
            toast.error('Set your address first');
            router.push({ name: 'restaurant-address' });
        }
    } catch (err) {
        console.error('Error loading delivery zones:', err);
        toast.error('Failed to load delivery zones');
    } finally {
        isLoading.value = false;
        setTimeout(() => {
            ignoreAutoSave = false;
        }, 1000)
    }
};

const onDone = async () => {
    const shape = mapComp.value?.getCurrentShape();
    console.log(`mapComp.value?.getCurrentShape:`, shape)
    if (!shape) {
        toast.error('No shape found')
        return;
    };

    // Create or update zone based on shape type
    const newZone: DeliveryZone = {
        id: selectedZone.value?.id || crypto.randomUUID(),
        name: selectedZone.value?.name || `Zone ${deliveryZones.value.length + 1}`,
        shapeType: shape instanceof google.maps.Circle ? 'circle' :
            shape instanceof google.maps.Rectangle ? 'rectangle' : 'polygon',
        isActive: true,
    }

    // Set shape-specific properties
    if (shape instanceof google.maps.Circle) {
        newZone.circleArea = {
            center: { lat: shape.getCenter()!.lat(), lng: shape.getCenter()!.lng() },
            radius: shape.getRadius()
        }
    } else if (shape instanceof google.maps.Rectangle) {
        const bounds = shape.getBounds()!;
        newZone.rectangleArea = {
            topLeft: { lat: bounds.getNorthEast().lat(), lng: bounds.getSouthWest().lng() },
            bottomRight: { lat: bounds.getSouthWest().lat(), lng: bounds.getNorthEast().lng() }
        }
    } else if (shape instanceof google.maps.Polygon) {
        newZone.polygonArea = shape.getPath().getArray().map(point => ({
            lat: point.lat(),
            lng: point.lng()
        }))
    }

    // Update or add zone
    const existingIndex = deliveryZones.value.findIndex(z => z.id === newZone.id)
    if (existingIndex !== -1) {
        deliveryZones.value[existingIndex] = newZone
    } else {
        deliveryZones.value.push(newZone)
    }

    // await saveDeliveryZones();
    isDialogOpen.value = false
    selectedZone.value = null
}

const openDialog = (zone?: DeliveryZone) => {
    selectedZone.value = zone || null
    isDialogOpen.value = true
}

const confirmDelete = (zone: DeliveryZone) => {
    zoneToDelete.value = zone;
    isAlertDialogOpen.value = true;
}

const deleteZone = async () => {
    if (!zoneToDelete.value) return;

    deliveryZones.value = deliveryZones.value.filter(z => z.id !== zoneToDelete.value?.id)
    // await saveDeliveryZones();
    isAlertDialogOpen.value = false;
    zoneToDelete.value = null;
}

// Save delivery zones to API
const saveDeliveryZones = async () => {
    isLoading.value = true;
    try {
        const { error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                deliveryZones: {
                    zones: deliveryZones.value
                }
            }
        })).json();

        if (error) {
            toast.error('Failed to save delivery zones');
            return;
        }
        toast.success('Saved successfully');
    } catch (err) {
        console.error('Error saving delivery zones:', err);
        toast.error('Failed to save delivery zones');
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadDeliveryZones();
});
</script>

<template>
    <div class="space-y-4 p-4">
        <div class="flex justify-between items-center">
            <Button @click="openDialog()"
                    variant="outline">
                <Plus class="w-4 h-4" />Add new zone
            </Button>
            <Button @click="saveDeliveryZones()"
                    variant="outline"
                    :disabled="isLoading">
                <Loader2 class="w-4 h-4 animate-spin"
                         v-if="isLoading" />Auto save
                <Check />
            </Button>
        </div>
        <div class="space-y-4">
            <ZoneCard v-for="zone in deliveryZones"
                      :key="zone.id"
                      :zone="zone"
                      @openDialog="openDialog"
                      @confirmDelete="confirmDelete" />
        </div>

        <div v-if="deliveryZones.length > 1"
             class="flex justify-between items-center">
            <Button @click="openDialog()"
                    variant="outline">
                <Plus class="w-4 h-4" />Add new zone
            </Button>
            <Button @click="saveDeliveryZones()"
                    :disabled="isLoading">
                <Loader2 class="w-4 h-4 animate-spin"
                         v-if="isLoading" />Save
            </Button>
        </div>

        <Dialog v-model:open="isDialogOpen">
            <DialogContent class="flex h-full min-h-full min-w-full flex-col p-0 sm:p-2 md:h-[70vh] md:min-h-[70vh] md:min-w-[80vw] lg:min-w-[50vw]"
                           @interact-outside="(event) => {
                            const target = event.target as HTMLElement;
                            if (target?.closest('[data-sonner-toaster]')) return event.preventDefault();
                        }">
                <DialogHeader>
                    <DialogTitle class="flex items-center gap-2">
                        Draw/Edit Single Zone
                    </DialogTitle>
                    <DialogDescription class="text-xs">
                        Click shape btns to draw new
                        <br>
                        or edit/resize/move current shape with small dots around the edges
                    </DialogDescription>
                </DialogHeader>
                <GoogleMapsEditor ref="mapComp"
                                  class="flex-1 overflow-hidden"
                                  :restaurant-location="restaurantLocation"
                                  :delivery-zones="deliveryZones"
                                  :selected-zone="selectedZone" />
                <DialogFooter>
                    <Button @click="onDone"
                            class="w-full"
                            :disabled="isLoading"
                            type="button">
                        <Loader2 v-if="isLoading"
                                 class="animate-spin" />
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <AlertDialog v-model:open="isAlertDialogOpen">
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Zone</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this delivery zone? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction class="bg-destructive text-destructive-foreground"
                                       @click="deleteZone">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
</template>
