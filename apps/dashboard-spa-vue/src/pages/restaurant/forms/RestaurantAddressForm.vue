<script setup lang="ts">
import GeolocationSelectionMap from '@/ui-plus/geolocation-selection-map/GeolocationSelectionMap.vue';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DoorOpen } from "lucide-vue-next";
import { AutoForm, AutoFormLabel } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import AutoFormFieldCountry from '@/ui-plus/auto-form/AutoFormFieldCountry.vue'
import { onMounted, ref } from 'vue';
import { toast } from '@/ui-plus/sonner';
import { fetchCountryCode } from '@/ui-plus/PhoneNumber/basePhoneInput/helpers/use-phone-input';
import Autocomplete from '@/ui-plus/auto-complete/Autocomplete.vue'
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form'
import { type predictionExtraType } from 'lib/apiClients/ecomApiClient'
import { autocomplete, geocode, getOpenStreetMapItems } from './utils'
import { currentRestaurantId } from '@src/stores/RestaurantStore';
import { dashboardApiClient } from '@src/lib/dashboardApiClient';

const schema = z.object({
    addressCountry: z.string().min(1, 'Address is required'),
    addressFull: z.string().min(1, 'Address is required'),
    addressDetails: z.string().optional(),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})


const loadData = async () => {
    isLoading.value = true;
    console.log('loadData', currentRestaurantId.value);
    // // sleep 1 second
    // await new Promise(resolve => setTimeout(resolve, 1000));
    const { data, error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$post({
        param: {
            restaurantId: currentRestaurantId.value ?? '',
        },
        json: {
            columns: {
                addressCountry: true,
                addressFull: true,
                addressDetails: true,
            }
        }
    })).json()
    if (error) {
        handleError(error, form);
    } else {
        if (data) {
            for (const key in data) {
                const typedKey = key as keyof typeof schema.shape;
                if (data[typedKey]) {
                    form.setFieldValue(typedKey, data[typedKey]);
                }
            }
        }
    }
    isLoading.value = false;
}

onMounted(() => {
    fetchCountryCode().then(countryCode => {
        form.setFieldValue('addressCountry', countryCode);
        loadData();
    });
})






const options = ref<string[]>([]);
const isInputLoading = ref(false);
let predictions: predictionExtraType[] = [];

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
async function onInputChange(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    isInputLoading.value = true;
    predictions = [];
    options.value = [];
    clearTimeout(debounceTimer);
    if (query.length < 3) {
        isInputLoading.value = false;
        return;
    }
    debounceTimer = setTimeout(async () => {
        const geocodeResult = await geocode(query, form.values.addressCountry);
        if (geocodeResult) {
            predictions = geocodeResult;
        }
        const { data, error } = await autocomplete(query, form.values.addressCountry);
        if (error) {
            console.error("error", error);
        } else {
            predictions.push(...data.predictions);
            options.value = predictions.map(prediction => prediction.description) || [];
        }
        isInputLoading.value = false;
    }, 1000);
}



const isDialogOpen = ref(false);
const mapComp = ref<InstanceType<typeof GeolocationSelectionMap>>();


const { isLoading, globalError, handleError, withSubmit } = useFormPlus();



async function onSubmit(values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        console.log('values', values);
        const [geocodeResult, openStreetMapItems] = await Promise.all([
            geocode(values.addressFull, form.values.addressCountry?.toLowerCase()),
            getOpenStreetMapItems(values.addressFull, form.values.addressCountry?.toLowerCase())
        ]);
        console.log('geocodeResult', geocodeResult);
        console.log('openStreetMapItems', openStreetMapItems);
        isDialogOpen.value = true;
        await new Promise(resolve => setTimeout(resolve, 500));
        if (mapComp && mapComp.value && mapComp.value.mapView) {
            mapComp.value.address = values.addressFull + (values.addressDetails ? `, ${values.addressDetails}` : "");
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

async function onMapConfirm() {
    isDialogOpen.value = false;
    if (mapComp && mapComp.value && mapComp.value.mapView) {
        isLoading.value = true;
        const { lat, lng } = mapComp.value.mapView.getCenter();
        console.log('lat', lat);
        console.log('lng', lng);
        const { data, error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                ...form.values,
                addressLat: lat,
                addressLng: lng,
            }
        })).json()
        if (error) {
            handleError(error, form);
        } else {
            // Success
            console.log('data', data);
        }
        // wait 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(`Saved`);
        isLoading.value = false;
    };
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
                addressCountry: {
                    component: AutoFormFieldCountry,
                    label: 'Country',
                    inputProps: {
                        // disabled: true,
                    },
                },
                addressFull: {
                    // component: AutoFormFieldAddress,
                    // description: 'Enter your full address',
                    label: 'Street Name & Number',
                    inputProps: {
                        placeholder: 'Enter your full address',
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


        <template #addressFull="_slotProps">
            <FormField v-slot="slotProps"
                       name="addressFull">
                <FormItem>
                    <AutoFormLabel :required="true">
                        Street Name & Number
                    </AutoFormLabel>
                    <FormControl>
                        <Autocomplete @inputChange="onInputChange"
                                      @optionClick="(optionIndex) => {
                                        slotProps.setValue(options[optionIndex]);
                                    }"
                                      :options="options"
                                      :isInputLoading="isInputLoading"
                                      :autocomplete="options.length > 0 ? 'off' : 'shipping street-address'"
                                      v-bind="{ ...slotProps.componentField, ..._slotProps.config?.inputProps }" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </FormField>
        </template>



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
                Save
            </Button>
        </div>
    </AutoForm>
</template>