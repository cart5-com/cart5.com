<script setup lang="ts">
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
import { geocode, getOpenStreetMapItems } from './utils'
import { currentRestaurantId } from '@src/stores/RestaurantStore';
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { DependencyType } from '@/ui-plus/auto-form/interface';

const schema = z.object({
    addressCountry: z.string().min(1, 'Address is required'),
    addressTimezone: z.string().min(1, 'Timezone is required'),
    address1: z.string().min(1, 'Address is required'),
    address2: z.string().optional(),
    addressCity: z.string().optional(),
    addressState: z.string().optional(),
    addressPostalCode: z.string().optional(),
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
    const { data, error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$post({
        param: {
            restaurantId: currentRestaurantId.value ?? '',
        },
        json: {
            columns: {
                address1: true,
                address2: true,
                addressCity: true,
                addressState: true,
                addressPostalCode: true,
                addressCountry: true,
                addressTimezone: true,
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
    form.setFieldValue('addressTimezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
    fetchCountryCode().then(countryCode => {
        form.setFieldValue('addressCountry', countryCode);
        loadData();
    });
})



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
        const { data, error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$patch({
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

const address1Label = ref('Street Name & Number (Address 1)');
const address2Label = ref('Apt, Suite, Unit, Building (Address 2)');
const addressStateLabel = ref('State/Province/Territory');
const addressCityLabel = ref('City');
const addressPostalCodeLabel = ref('Postcode/Zip');

watch(() => form.values.addressCountry, (newCountry) => {
    if (newCountry && newCountry === 'GB') {
        address1Label.value = 'Address line 1 (or company name)';
        address2Label.value = 'Address line 2 (optional)';
        addressCityLabel.value = 'Town/City';
        addressStateLabel.value = 'County (if applicable)';
        addressPostalCodeLabel.value = 'Postcode';
    } else {
        address1Label.value = 'Street Name & Number (Address 1)';
        address2Label.value = 'Apt, Suite, Unit, Building (Address 2)';
        addressStateLabel.value = 'State';
        addressCityLabel.value = 'City';
        addressPostalCodeLabel.value = 'Postcode/Zip';
    }
});


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
                <Button @click="onMapConfirm"
                        class="w-full"
                        type="button"> Confirm </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <AutoForm class="space-y-6"
              :schema="schema"
              :dependencies="[
                {
                    sourceField: 'addressCountry',
                    type: DependencyType.HIDES,
                    targetField: 'addressState',
                    when: (country) => !COUNTRIES_WITH_STATES.includes(country),
                }
            ]"
              :field-config="{
                addressCountry: {
                    component: AutoFormFieldCountry,
                    label: 'Country',
                    inputProps: {
                        // disabled: true,
                    },
                },
                addressTimezone: {
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
                    inputProps: {
                        autocomplete: 'address-line2',
                    },
                },
                addressCity: {
                    label: addressCityLabel,
                    inputProps: {
                        autocomplete: 'address-level2',
                    },
                },
                addressState: {
                    label: addressStateLabel,
                    inputProps: {
                        autocomplete: 'address-level1',
                    },
                },
                addressPostalCode: {
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