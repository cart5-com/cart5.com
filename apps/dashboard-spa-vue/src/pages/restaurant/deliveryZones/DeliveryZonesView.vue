<script setup lang="ts">
import GoogleMapsEditor from './GoogleMapsEditor.vue'
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
import { Loader2, MapPin } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';

const mapComp = ref<InstanceType<typeof GoogleMapsEditor>>();
let restaurantLocation: { lat: number, lng: number };
const deliveryZones = ref<DeliveryZone[]>([])
const isDialogOpen = ref(false)
const isAlertDialogOpen = ref(false)
const selectedZone = ref<DeliveryZone | null>(null)
const zoneToDelete = ref<DeliveryZone | null>(null)
const isLoading = ref(false);

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
    } catch (err) {
        console.error('Error loading delivery zones:', err);
        toast.error('Failed to load delivery zones');
    } finally {
        isLoading.value = false;
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

    await saveDeliveryZones();
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
    await saveDeliveryZones();
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

        toast.success('Delivery zones saved successfully');
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
            <h1 class="text-2xl font-bold">Delivery Zones</h1>
            <Button @click="openDialog()">Add Zone</Button>
        </div>
        <div class="space-y-4">
            <Card v-for="zone in deliveryZones"
                  :key="zone.id"
                  class="shadow-sm">
                <CardContent class="p-4">
                    <div class="flex items-center justify-between">
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <MapPin class="h-4 w-4" />
                                <h3 class="font-medium">{{ zone.name }}</h3>
                            </div>
                            <p class="text-sm text-muted-foreground capitalize">
                                {{ zone.shapeType }} Zone
                            </p>
                        </div>
                        <div class="space-x-2">
                            <Button variant="outline"
                                    size="sm"
                                    @click="openDialog(zone)">
                                Edit
                            </Button>
                            <Button variant="destructive"
                                    size="sm"
                                    @click="confirmDelete(zone)">
                                Delete
                            </Button>
                        </div>
                    </div>

                    <Accordion type="single"
                               collapsible
                               class="mt-4">
                        <AccordionItem value="details">
                            <AccordionTrigger>Zone Details</AccordionTrigger>
                            <AccordionContent>
                                <pre
                                     class="text-sm bg-muted p-2 rounded-md overflow-x-auto">{{ JSON.stringify(zone, null, 2) }}
                                </pre>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>

        <Dialog v-model:open="isDialogOpen">
            <DialogContent class="flex h-full min-h-full min-w-full flex-col p-0 sm:p-2 md:h-[70vh] md:min-h-[70vh] md:min-w-[80vw] lg:min-w-[50vw]"
                           @interact-outside="(event) => {
                            const target = event.target as HTMLElement;
                            if (target?.closest('[data-sonner-toaster]')) return event.preventDefault();
                        }">
                <DialogHeader>
                    <DialogTitle class="flex items-center gap-2">
                        Edit Area
                    </DialogTitle>
                    <DialogDescription>
                        Draw or edit delivery zones on the map
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
