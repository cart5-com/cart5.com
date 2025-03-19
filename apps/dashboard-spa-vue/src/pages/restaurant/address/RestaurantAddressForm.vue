<script setup lang="ts">
import GeolocationSelectionMap from '@/ui-plus/geolocation-selection-map/GeolocationSelectionMap.vue';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DoorOpen } from "lucide-vue-next";
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import AutoFormFieldCountry from '@/ui-plus/auto-form/AutoFormFieldCountry.vue'
import AutoFormFieldTimezone from '@/ui-plus/auto-form/AutoFormFieldTimezone.vue'
import { onMounted, ref, watch } from 'vue';
import { toast } from '@/ui-plus/sonner';
import { fetchCountryCode } from '@/ui-plus/PhoneNumber/basePhoneInput/helpers/use-phone-input';
import { geocode, getOpenStreetMapItems } from '../utils'
import { currentRestaurantId, loadMyRestaurants } from '@src/stores/RestaurantStore';
import { apiClient } from '@api-client/index';
import { DependencyType } from '@/ui-plus/auto-form/interface';

const schema = z.object({
    country: z.string().min(1, 'Address is required'),
    timezone: z.string().min(1, 'Timezone is required'),
    address1: z.string().min(1, 'Address is required'),
    address2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

const COUNTRIES_WITH_STATES = [
    'US', // United States
    'CA', // Canada
    'AU', // Australia
    'BR', // Brazil
    'IN', // India
    'MX', // Mexico
    'AR', // Argentina
    'MY', // Malaysia
    'ID', // Indonesia
    'RU', // Russia
    'CN', // China
    'JP', // Japan
    'DE', // Germany
    'ES', // Spain
    'IT', // Italy
    'GB', // United Kingdom (has countries/regions)
    'FR', // France (has regions)
    'PH', // Philippines
    'PK', // Pakistan
    'NG', // Nigeria
    'VN', // Vietnam
    'ZA', // South Africa
    'TH', // Thailand
    'MM', // Myanmar (Burma)
    'KR', // South Korea
    'CO', // Colombia
    'VE', // Venezuela
]; // Add more as needed

const loadData = async () => {
    isLoading.value = true;
    console.log('loadData', currentRestaurantId.value);
    // // sleep 1 second
    // await new Promise(resolve => setTimeout(resolve, 1000));
    const { data: address, error } = await (await apiClient.dashboard.restaurant[':restaurantId'].address.get.$post({
        param: {
            restaurantId: currentRestaurantId.value ?? '',
        },
        json: {
            columns: {
                timezone: true,
                country: true,
                city: true,
                state: true,
                postalCode: true,
                address1: true,
                address2: true,
            }
        }
    })).json()
    if (error) {
        handleError(error, form);
    } else {
        if (address) {
            // form.setFieldValue('timezone', data.address?.timezone ?? undefined);
            // form.setFieldValue('country', data.address?.country ?? undefined);
            // form.setFieldValue('address1', data.address?.address1 ?? undefined);
            // form.setFieldValue('address2', data.address?.address2 ?? undefined);
            // form.setFieldValue('city', data.address?.city ?? undefined);
            // form.setFieldValue('state', data.address?.state ?? undefined);
            // form.setFieldValue('postalCode', data.address?.postalCode ?? undefined);
            // form.setFieldValue('postalCode', data.address?.postalCode ?? undefined);
            // for (const key in data.address) {
            //     const typedKey = key as keyof typeof schema.shape;
            //     if ((data.address as any)[key]) {
            //         form.setFieldValue(typedKey, (data.address as any)[key]);
            //     }
            // }
            for (const key in address) {
                const typedKey = key as keyof typeof schema.shape;
                if (address[typedKey]) {
                    form.setFieldValue(typedKey, address[typedKey]);
                }
            }
        }
    }
    isLoading.value = false;
}

onMounted(() => {
    form.setFieldValue('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
    fetchCountryCode().then(countryCode => {
        form.setFieldValue('country', countryCode);
        loadData();
    });
})



const isDialogOpen = ref(false);
const mapComp = ref<InstanceType<typeof GeolocationSelectionMap>>();
const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);
let locationMetadata: any = null;

async function onSubmit(values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        isLoading.value = true;
        console.log('values', values);
        const [geocodeResult, openStreetMapItems] = await Promise.all([
            geocode(values.address1, form.values.country?.toLowerCase()),
            getOpenStreetMapItems(values.address1, form.values.country?.toLowerCase())
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
        setTimeout(() => {
            isLoading.value = false;
        }, 500);
    })
}

async function onMapConfirm() {
    isDialogOpen.value = false;
    if (mapComp && mapComp.value && mapComp.value.mapView) {
        isLoading.value = true;
        const { lat, lng } = mapComp.value.mapView.getCenter();
        // const reverseGeocodeResult = await reverseGeocode(lat, lng);
        // console.log('reverseGeocodeResult', reverseGeocodeResult);
        const { data, error } = await (await apiClient.dashboard.restaurant[':restaurantId'].address.update.$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                ...form.values,
                lat: lat,
                lng: lng,
                geocodeMetadata: locationMetadata ? locationMetadata : null,
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
        await loadMyRestaurants();
    };
}

const address1Label = ref('Street address or P.O. Box (Address 1)');
const address2Label = ref('Apt, suite, unit, building, floor, etc. (Address 2)');
const hideAddress2Label = ref(false);
const addressStateLabel = ref('State/Province/Territory');
const addressCityLabel = ref('City');
const addressPostalCodeLabel = ref('Postcode/Zip');

watch(() => form.values.country, (newCountry) => {
    if (newCountry === 'US') {
        address1Label.value = 'Street address or P.O. Box';
        address2Label.value = 'Apt, suite, unit, building, floor, etc.';
        hideAddress2Label.value = true;
        addressCityLabel.value = 'City';
        addressStateLabel.value = 'State';
        addressPostalCodeLabel.value = 'Postcode';
    } else if (newCountry === 'GB') {
        address1Label.value = 'Address line 1 (or company name)';
        address2Label.value = 'Address line 2 (optional)';
        addressCityLabel.value = 'Town/City';
        addressStateLabel.value = 'County (if applicable)';
        hideAddress2Label.value = false;
        addressPostalCodeLabel.value = 'Postcode';
    } else if (newCountry === 'CA') {
        address1Label.value = 'Address';
        address2Label.value = 'Apt, suite, unit, building (Address 2)';
        hideAddress2Label.value = true;
        addressStateLabel.value = 'Province/Territory';
        addressCityLabel.value = 'City';
        addressPostalCodeLabel.value = 'Postal code';
    } else {
        address1Label.value = 'Street address or P.O. Box (Address 1)';
        address2Label.value = 'Apt, suite, unit, building, floor, etc. (Address 2)';
        addressStateLabel.value = 'State/Province/Territory';
        addressCityLabel.value = 'City';
        hideAddress2Label.value = true;
        addressPostalCodeLabel.value = 'Postcode/Zip';
    }
});


</script>

<template>

    <Dialog v-model:open="isDialogOpen">
        <DialogContent
                       class="flex h-full min-h-full min-w-full flex-col p-0 sm:p-2 md:h-[70vh] md:min-h-[70vh] md:min-w-[80vw] lg:min-w-[50vw]">
            <DialogHeader>
                <DialogTitle class="flex items-center gap-2">
                    <DoorOpen />
                    Confirm your entrance/door location
                </DialogTitle>
                <!-- <DialogDescription class="hidden text-sm sm:block">
                    Move the map to your entrance/door and click Confirm
                </DialogDescription> -->
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
                <Button type="button"
                        @click="onMapConfirm"
                        :disabled="isLoading"
                        class="w-full my-6">
                    <Loader2 v-if="isLoading"
                             class="animate-spin" />
                    Confirm
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <AutoForm class="space-y-6"
              :schema="schema"
              :dependencies="[
                {
                    sourceField: 'country',
                    type: DependencyType.HIDES,
                    targetField: 'state',
                    when: (country) => !COUNTRIES_WITH_STATES.includes(country),
                }
            ]"
              :field-config="{
                country: {
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
                    label: address1Label,
                    inputProps: {
                        placeholder: 'Enter your full address',
                        autocomplete: 'street-address',
                    },
                },
                address2: {
                    label: address2Label,
                    hideLabel: hideAddress2Label,
                    inputProps: {
                        placeholder: hideAddress2Label ? address2Label : '',
                        autocomplete: 'address-line2',
                    },
                },
                city: {
                    label: addressCityLabel,
                    inputProps: {
                        autocomplete: 'address-level2',
                    },
                },
                state: {
                    label: addressStateLabel,
                    inputProps: {
                        autocomplete: 'address-level1',
                    },
                },
                postalCode: {
                    label: addressPostalCodeLabel,
                    inputProps: {
                        autocomplete: 'postal-code',
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
                Save
            </Button>
        </div>
    </AutoForm>
</template>