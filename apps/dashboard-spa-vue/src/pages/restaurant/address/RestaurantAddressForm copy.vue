<!-- <script setup lang="ts">
import GeolocationSelectionMap from '@/ui-plus/geolocation-selection-map/GeolocationSelectionMap.vue';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    // DialogDescription,
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
import AutoFormFieldTimezone from '@/ui-plus/auto-form/AutoFormFieldTimezone.vue'
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
import { type predictionType } from '@lib/hono/apiClients/ecomApiClient'
import { autocomplete, geocode, getOpenStreetMapItems } from './utils'
import { currentRestaurantId } from '@src/stores/RestaurantStore';
import { dashboardApiClient } from '@src/lib/dashboardApiClient';

const schema = z.object({
    addressCountry: z.string().min(1, 'Address is required'),
    timezone: z.string().min(1, 'Timezone is required'),
    address1: z.string().min(1, 'Address is required'),
    address2: z.string().optional(),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})


const loadData = async () => {
    isLoading.value = true;
    console.log('loadData', currentRestaurantId.value);
    // // sleep 1 second
    // await new Promise(resolve => setTimeout(resolve, 1000));
    const { data, error } = await (await dashboardApiClient.api_dashboard.restaurant[':restaurantId'].$post({
        param: {
            restaurantId: currentRestaurantId.value ?? '',
        },
        json: {
            columns: {
                addressCountry: true,
                timezone: true,
                address1: true,
                address2: true,
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
    form.setFieldValue('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
    fetchCountryCode().then(countryCode => {
        form.setFieldValue('addressCountry', countryCode);
        loadData();
    });
})






const options = ref<string[]>([]);
const isInputLoading = ref(false);
let predictions: predictionType[] = [];

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
        // const geocodeResult = await geocode(query, form.values.addressCountry);
        // if (geocodeResult) {
        //     predictions = (geocodeResult.data.results.map(item => ({
        //         description: item.formatted_address,
        //         lat: item.geometry.location.lat,
        //         lng: item.geometry.location.lng,
        //         isGeocodeResult: true,
        //         geocodeResult: item,
        //     })) as unknown) as predictionExtraType[];
        // }
        predictions = [];
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

function onInputOptionSelected(optionIndex: number) {
    form.setFieldValue('address1', options.value[optionIndex]);
    const prediction = predictions[optionIndex];
    console.log('prediction', prediction);
}



const isDialogOpen = ref(false);
const mapComp = ref<InstanceType<typeof GeolocationSelectionMap>>();


const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);

let locationMetadata: any = null;
async function onSubmit(values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        console.log('values', values);
        const [geocodeResult, openStreetMapItems] = await Promise.all([
            geocode(values.address1, form.values.addressCountry?.toLowerCase()),
            getOpenStreetMapItems(values.address1, form.values.addressCountry?.toLowerCase())
        ]);
        locationMetadata = geocodeResult;
        console.log('openStreetMapItems', openStreetMapItems);
        isDialogOpen.value = true;
        await new Promise(resolve => setTimeout(resolve, 500));
        if (mapComp && mapComp.value && mapComp.value.mapView) {
            mapComp.value.address = values.address1 + (values.address2 ? `, ${values.address2}` : "");
            // 43.646294506256936, -79.38741027876338
            if (geocodeResult && geocodeResult.data.results.length > 0) {
                mapComp.value.mapView.setView([
                    geocodeResult.data.results[0].geometry.location.lat,
                    geocodeResult.data.results[0].geometry.location.lng
                ], 18);
            } else {
                mapComp.value.mapView.setView([openStreetMapItems[0].lat, openStreetMapItems[0].lng], 18);
            }
            mapComp.value.helperBtns = [
                ...(
                    geocodeResult &&
                        geocodeResult.data.results.length > 0 ?
                        geocodeResult.data.results.map(item => ({
                            label: item.formatted_address,
                            lat: item.geometry.location.lat,
                            lng: item.geometry.location.lng
                        })) :
                        []
                ),
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
        // const reverseGeocodeResult = await reverseGeocode(lat, lng);
        // console.log('reverseGeocodeResult', reverseGeocodeResult);
        const { data, error } = await (await dashboardApiClient.api_dashboard.restaurant[':restaurantId'].$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                ...form.values,
                addressLat: lat,
                addressLng: lng,
                addressMetadata: locationMetadata ? locationMetadata : null,
            }
        })).json()
        if (error) {
            handleError(error, form);
        } else {
            // Success
            console.log('data', data);
        }
        // wait 1 second
        // await new Promise(resolve => setTimeout(resolve, 1000));
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
                    Confirm your entrance/door location
                </DialogTitle>

            </DialogHeader>
            <GeolocationSelectionMap ref="mapComp"
                                     class="flex-1 overflow-hidden" />
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
                timezone: {
                    component: AutoFormFieldTimezone,
                    label: 'Timezone',
                },
                address1: {
                    // component: AutoFormFieldAddress,
                    // description: 'Enter your full address',
                    label: 'Street Name & Number',
                    inputProps: {
                        placeholder: 'Enter your full address',
                    },
                },
                address2: {
                    label: 'Apt, Suite, Unit, Building',
                    inputProps: {
                        autocomplete: 'address-line2',
                    },
                }
            }"
              :form="form"
              @submit="onSubmit">


        <template #address1="_slotProps">
            <FormField v-slot="slotProps"
                       name="address1">
                <FormItem>
                    <AutoFormLabel :required="true">
                        Street Name & Number
                    </AutoFormLabel>
                    <FormControl>
                        <Autocomplete @inputChange="onInputChange"
                                      @optionClick="(optionIndex) => {
                                        // slotProps.setValue(options[optionIndex]);
                                        onInputOptionSelected(optionIndex);
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
</template> -->