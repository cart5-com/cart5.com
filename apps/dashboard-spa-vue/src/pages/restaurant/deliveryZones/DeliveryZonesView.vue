<script setup lang="ts">
// import GoogleMapsEditor from './GoogleMapsEditor.vue'
import LeafletEditor from './LeafletEditor.vue'
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
import { apiClient } from '@api-client/index';
import { currentRestaurantId } from '@dashboard-spa-vue/stores/RestaurantStore';
import { type DeliveryZone } from '@lib/types/restaurantTypes';
import { Check, Loader2, Plus } from 'lucide-vue-next';
import { onMounted, ref, watch } from 'vue';
import { pageTitle } from '@dashboard-spa-vue/stores/layout.store';
import { useRouter } from 'vue-router';
import { Switch } from '@/components/ui/switch';
const router = useRouter();

const mapComp = ref<InstanceType<typeof LeafletEditor>>();
// const mapComp2 = ref<InstanceType<typeof GoogleMapsEditor>>();
let restaurantLocation: { lat: number, lng: number };
const isDialogOpen = ref(false)
const isAlertDialogOpen = ref(false)
const selectedZone = ref<DeliveryZone | null>(null)
const zoneToDelete = ref<DeliveryZone | null>(null)
const isLoading = ref(false);
const offersDelivery = ref(false)
const deliveryZones = ref<DeliveryZone[]>([])

let ignoreAutoSave = true;
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch([deliveryZones, offersDelivery], () => {
    if (ignoreAutoSave) return;
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
        saveDeliveryZones()
    }, 3000)
}, { deep: true, immediate: true })

pageTitle.value = 'Delivery Options'

const loadData = async () => {
    const apiPath = apiClient.dashboard.restaurant[':restaurantId'];
    const param = {
        restaurantId: currentRestaurantId.value ?? '',
    }
    const [
        addressResponse,
        offersDeliveryResponse,
        deliveryZonesResponse
    ] = await Promise.all([
        (await apiPath.address.get.$post({
            param,
            json: {
                columns: {
                    lat: true,
                    lng: true,
                },
            }
        })).json(),
        (await apiPath.$post({
            param,
            json: {
                columns: {
                    offersDelivery: true,
                },
            }
        })).json(),
        (await apiPath.delivery_zones.get.$post({
            param,
            json: {
                columns: {
                    zones: true
                },
            }
        })).json(),
    ]);
    return { addressResponse, offersDeliveryResponse, deliveryZonesResponse };
}

// Load delivery zones from API
const loadDeliveryZones = async () => {
    isLoading.value = true;
    try {
        const { addressResponse, offersDeliveryResponse, deliveryZonesResponse } = await loadData();

        const { data: address, error } = addressResponse;
        const { data: offersDeliveryData, error: offersDeliveryError } = offersDeliveryResponse;
        const { data: deliveryZonesData, error: deliveryZonesError } = deliveryZonesResponse;

        if (error || offersDeliveryError || deliveryZonesError) {
            toast.error('Failed to load delivery zones');
            return;
        }
        restaurantLocation = {
            lat: address?.lat ?? 0,
            lng: address?.lng ?? 0,
        }
        deliveryZones.value = deliveryZonesData?.zones ?? [];
        offersDelivery.value = offersDeliveryData?.offersDelivery ?? false;
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

const onLeafletDone = () => {
    const shape = mapComp.value?.getCurrentShape();
    if (!shape) {
        toast.error('Please draw a shape first')
        return;
    };

    // Create or update zone based on shape type
    const newZone: DeliveryZone = {
        id: selectedZone.value?.id || crypto.randomUUID(),
        name: selectedZone.value?.name || `Zone ${deliveryZones.value.length + 1}`,
        shapeType: shape instanceof window.L.Circle ? 'circle' :
            shape instanceof window.L.Rectangle ? 'rectangle' : 'polygon',
        isActive: true,
    }

    // Set shape-specific properties
    if (shape instanceof window.L.Circle) {
        newZone.circleArea = {
            center: { lat: shape.getLatLng().lat, lng: shape.getLatLng().lng },
            radius: shape.getRadius()
        }
    } else if (shape instanceof window.L.Rectangle) {
        const bounds = shape.getBounds()!;
        newZone.rectangleArea = {
            topLeft: bounds.getNorthWest(),
            bottomRight: bounds.getSouthEast()
        }
    } else if (shape instanceof window.L.Polygon) {
        newZone.polygonArea = (shape.getLatLngs()[0] as L.LatLng[]).map(point => ({
            lat: point.lat,
            lng: point.lng
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
// async function onDone() {
//     return;
//     const shape = mapComp2.value?.getCurrentShape();
//     if (!shape) {
//         toast.error('Please draw a shape first')
//         return;
//     };

//     // Create or update zone based on shape type
//     const newZone: DeliveryZone = {
//         id: selectedZone.value?.id || crypto.randomUUID(),
//         name: selectedZone.value?.name || `Zone ${deliveryZones.value.length + 1}`,
//         shapeType: shape instanceof google.maps.Circle ? 'circle' :
//             shape instanceof google.maps.Rectangle ? 'rectangle' : 'polygon',
//         isActive: true,
//     }

//     // Set shape-specific properties
//     if (shape instanceof google.maps.Circle) {
//         newZone.circleArea = {
//             center: { lat: shape.getCenter()!.lat(), lng: shape.getCenter()!.lng() },
//             radius: shape.getRadius()
//         }
//     } else if (shape instanceof google.maps.Rectangle) {
//         const bounds = shape.getBounds()!;
//         newZone.rectangleArea = {
//             topLeft: { lat: bounds.getNorthEast().lat(), lng: bounds.getSouthWest().lng() },
//             bottomRight: { lat: bounds.getSouthWest().lat(), lng: bounds.getNorthEast().lng() }
//         }
//     } else if (shape instanceof google.maps.Polygon) {
//         newZone.polygonArea = shape.getPath().getArray().map(point => ({
//             lat: point.lat(),
//             lng: point.lng()
//         }))
//     }

//     // Update or add zone
//     const existingIndex = deliveryZones.value.findIndex(z => z.id === newZone.id)
//     if (existingIndex !== -1) {
//         deliveryZones.value[existingIndex] = newZone
//     } else {
//         deliveryZones.value.push(newZone)
//     }

//     // await saveDeliveryZones();
//     isDialogOpen.value = false
//     selectedZone.value = null
// }


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

const saveData = async () => {
    const apiPath = apiClient.dashboard.restaurant[':restaurantId'];
    const param = {
        restaurantId: currentRestaurantId.value ?? '',
    }
    const [deliveryZonesResponse, offersDeliveryResponse] = await Promise.all([
        (await apiPath.delivery_zones.update.$patch({
            param,
            json: {
                zones: deliveryZones.value
            }
        })).json(),
        (await apiPath.$patch({
            param,
            json: {
                offersDelivery: offersDelivery.value
            }
        })).json(),
    ])
    return { deliveryZonesResponse, offersDeliveryResponse };
}

// Save delivery zones to API
const saveDeliveryZones = async () => {
    isLoading.value = true;
    try {
        const { deliveryZonesResponse, offersDeliveryResponse } = await saveData();
        const { error } = deliveryZonesResponse;
        const { error: offersDeliveryError } = offersDeliveryResponse;
        if (error || offersDeliveryError) {
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
    <div>
        <label for="offersDelivery"
               class="flex items-center justify-between p-4 border rounded-lg cursor-pointer max-w-sm mx-auto">
            <div class="space-y-0.5">
                <h3 class="text-lg font-medium">Delivery status</h3>
                <p class="text-muted-foreground">Do you offer food delivery?</p>
            </div>
            <div class="flex items-center space-x-3">
                <Switch id="offersDelivery"
                        :checked="offersDelivery"
                        @update:checked="(checked: boolean) => offersDelivery = checked"
                        :disabled="isLoading"
                        class="scale-125">
                </Switch>
                <span class="font-medium">{{ offersDelivery ? 'Yes' : 'No' }}</span>
            </div>
        </label>
        <div v-if="offersDelivery"
             class="space-y-4 p-4">
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
                <div v-if="deliveryZones.length === 0"
                     class="text-center text-muted-foreground">
                    No delivery zones found.
                    <br>
                    you need to add at least one zone to start accepting delivery orders
                    <br>
                    <Button @click="openDialog()"
                            variant="outline">
                        <Plus class="w-4 h-4" />Add new zone
                    </Button>
                </div>
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
        </div>

        <Dialog v-model:open="isDialogOpen">
            <DialogContent
                           class="flex h-full min-h-full min-w-full flex-col p-0 sm:p-2 md:h-[70vh] md:min-h-[70vh] md:min-w-[80vw] lg:min-w-[50vw]">
                <DialogHeader>
                    <DialogTitle class="flex items-center gap-2">
                        Draw/Edit Single Zone
                    </DialogTitle>
                    <DialogDescription class="text-xs">
                        Click shape btns to draw new
                        <br>
                        or edit/resize/move current shape with small squares 🔲 around the edges
                    </DialogDescription>
                </DialogHeader>

                <LeafletEditor ref="mapComp"
                               class="flex-1 overflow-hidden"
                               :restaurant-location="restaurantLocation"
                               :delivery-zones="deliveryZones"
                               :selected-zone="selectedZone" />

                <!-- <GoogleMapsEditor ref="mapComp2"
                                  class="flex-1 overflow-hidden"
                                  :restaurant-location="restaurantLocation"
                                  :delivery-zones="deliveryZones"
                                  :selected-zone="selectedZone" /> -->
                <DialogFooter>
                    <Button @click="onLeafletDone"
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
