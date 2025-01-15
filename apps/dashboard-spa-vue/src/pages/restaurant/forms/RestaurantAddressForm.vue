<script setup lang="ts">
import GeolocationSelectionMap from '@/ui-plus/geolocation-selection-map/GeolocationSelectionMap.vue';
import { Button } from '@/components/ui/button';
import { mapsApiClient } from '@src/lib/dashboardApiClient';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    // DialogTrigger
} from "@/components/ui/dialog";
import { DoorOpen } from "lucide-vue-next";
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import AutoFormFieldAddress from '@/ui-plus/auto-form/AutoFormFieldAddress.vue'
import { onMounted, ref } from 'vue';
import { type predictionExtraType } from 'lib/apiClients/ecomApiClient'
import { toast } from '@/ui-plus/sonner';

const isDialogOpen = ref(false);
const mapComp = ref<InstanceType<typeof GeolocationSelectionMap>>();

const schema = z.object({
    address: z.string().min(1, 'Address is required'),
    addressDetails: z.string().optional(),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

const { isLoading, globalError,
    // handleError,
    withSubmit } = useFormPlus();

onMounted(() => {
    // setTimeout(() => {
    //     form.setFieldValue('address', 'main street bla bla')
    // }, 1000)
})

async function getOpenStreetMapItems(
    addressQuery: string,
    countrySelectElemValue?: string
): Promise<{ lat: number; lng: number; label: string }[]> {
    // https://nominatim.org/release-docs/latest/api/Search/
    const url =
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(addressQuery)}&` +
        `limit=40&` +
        `addressdetails=1&` +
        `extratags=1&` +
        `namedetails=1&` +
        (countrySelectElemValue ? `countrycodes=${countrySelectElemValue}&` : "") +
        `format=json`;
    const response = await fetch(url);
    return (await response.json()).map((item: { lat: number; lon: number; display_name: string }) => {
        return {
            lat: item.lat,
            lng: item.lon,
            label: item.display_name
        };
    });
}

async function onSubmit(values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        console.log('values', values);
        const [geocodeResult, openStreetMapItems] = await Promise.all([
            geocode(values.address),
            getOpenStreetMapItems(values.address)
        ]);
        console.log('geocodeResult', geocodeResult);
        console.log('openStreetMapItems', openStreetMapItems);
        isDialogOpen.value = true;
        await new Promise(resolve => setTimeout(resolve, 500));
        if (mapComp && mapComp.value && mapComp.value.mapView) {
            mapComp.value.address = values.address + (values.addressDetails ? `, ${values.addressDetails}` : "");
            // 43.646294506256936, -79.38741027876338
            if (geocodeResult && geocodeResult.length > 0) {
                mapComp.value.mapView.setView([geocodeResult[0].lat!, geocodeResult[0].lng!], 18);
            } else {
                mapComp.value.mapView.setView([openStreetMapItems[0].lat, openStreetMapItems[0].lng], 18);
            }
            mapComp.value.helperBtns = [
                ...(geocodeResult && geocodeResult.length > 0 ? geocodeResult.map(item => ({
                    label: item.description,
                    lat: item.lat!,
                    lng: item.lng!
                })) : []),
                ...openStreetMapItems.map(item => ({
                    label: item.label,
                    lat: item.lat,
                    lng: item.lng
                }))
            ];
        }
    })
}

function onMapConfirm() {
    console.log('onMapConfirm');
    if (mapComp && mapComp.value && mapComp.value.mapView) {
        const { lat, lng } = mapComp.value.mapView.getCenter();
        console.log("confirmed coordinates", {
            lat,
            lng
        });
        toast.success(`Address confirmed: ${form.values.address} ${form.values.addressDetails} ${lat} ${lng}`);
    };
    isDialogOpen.value = false;
}

async function geocode(address: string) {
    const { data, error } = await (await mapsApiClient.api.maps.gmaps.geocode.$get({
        query: {
            address: address.trim().toLowerCase(),
        }
    })).json();
    if (error) {
        console.error("error", error);
        return null;
    }
    if (data && data.results && data.results.length > 0) {
        return [
            {
                description: data.results[0].formatted_address,
                lat: data.results[0].geometry.location.lat,
                lng: data.results[0].geometry.location.lng
            }
        ] as predictionExtraType[];
    }
    return null;
}
</script>

<template>

    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="flex h-full min-h-full min-w-full flex-col p-0 sm:p-2 md:h-[70vh] md:min-h-[70vh] md:min-w-[80vw] lg:min-w-[50vw]"
                       @interact-outside="(event) => {
                        const target = event.target as HTMLElement;
                        if (target?.closest('[data-sonner-toaster]')) return event.preventDefault();
                    }
                        ">
            <DialogHeader>
                <DialogTitle class="flex items-center gap-2">
                    <DoorOpen />
                    Confirm your address entrance/door location
                </DialogTitle>
                <DialogDescription class="hidden text-sm sm:block">
                    Move the map to your entrance/door and click Confirm
                </DialogDescription>
            </DialogHeader>
            <GeolocationSelectionMap ref="mapComp"
                                     class="flex-1 overflow-hidden" />
            <!-- <div class="grid gap-4 py-4">
                     <div class="grid grid-cols-4 items-center gap-4">
                         <Label for="name" class="text-right"> Name </Label>
                         <Input id="name" value="Pedro Duarte" class="col-span-3" />
                     </div>
                     <div class="grid grid-cols-4 items-center gap-4">
                         <Label for="username" class="text-right"> Username </Label>
                         <Input id="username" value="@peduarte" class="col-span-3" />
                     </div>
                 </div>
                 -->
            <DialogFooter>
                <Button @click="onMapConfirm"
                        class="w-full"
                        type="button"> Confirm </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <AutoForm class="space-y-6"
              :schema="schema"
              :field-config="{
                address: {
                    component: AutoFormFieldAddress,
                    description: 'Enter your full address',
                    inputProps: {
                        // placeholder: 'Enter your full address',
                    },
                },
                addressDetails: {
                    label: 'Apt, Suite, Unit, Building',
                    inputProps: {
                        autocomplete: 'address-line2',
                    },
                }
            }"
              :form="form"
              @submit="onSubmit">
        <div class="text-sm font-medium text-destructive"
             v-if="globalError">
            {{ globalError }}
        </div>
        <div>
            <Button type="submit"
                    :disabled="isLoading"
                    class="w-full my-6">
                <Loader2 v-if="isLoading"
                         class="animate-spin" />
                Update
            </Button>
        </div>
    </AutoForm>
</template>