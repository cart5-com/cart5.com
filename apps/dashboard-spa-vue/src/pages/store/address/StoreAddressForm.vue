<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DoorOpen, MapPin } from "lucide-vue-next";
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import AutoFormFieldCountry from '@/ui-plus/auto-form/AutoFormFieldCountry.vue'
import { onMounted, ref, watch } from 'vue';
import { toast } from '@/ui-plus/sonner';
import { fetchCountryCode } from '@/ui-plus/PhoneNumber/basePhoneInput/helpers/use-phone-input';
import { currentStoreId, loadMyStores } from '@dashboard-spa-vue/stores/MyStoresStore';
import { apiClient } from '@api-client/index';
import { DependencyType } from '@/ui-plus/auto-form/interface';

import GeolocationMap from '@/ui-plus/geolocation-selection-map/GeolocationMap.vue';
import { loadLeafletCDN } from '@/ui-plus/geolocation-selection-map/loadLeafletCDN';

const schema = z.object({
    country: z.string().min(1, 'Address is required'),
    address1: z.string().min(1, 'Address is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    postalCode: z.string().min(1, 'Postal code is required'),
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

let lat: number | null = null;
let lng: number | null = null;

const loadData = async () => {
    isLoading.value = true;
    console.log('loadData', currentStoreId.value);
    // // sleep 1 second
    // await new Promise(resolve => setTimeout(resolve, 1000));
    const { data: address, error } = await (await apiClient.dashboard.store[':storeId'].address.get.$post({
        param: {
            storeId: currentStoreId.value ?? '',
        },
        json: {
            columns: {
                country: true,
                city: true,
                state: true,
                postalCode: true,
                address1: true,
                address2: true,
                lat: true,
                lng: true,
            }
        }
    })).json()
    if (error) {
        handleError(error, form);
    } else {
        if (address) {
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
            // if (address?.lat && address?.lng) {
            //     mapLocation.value.lat = address.lat;
            //     mapLocation.value.lng = address.lng;
            // }
            lat = address.lat;
            lng = address.lng;
        }
        if (!address || !address.country) {
            fetchCountryCode().then(countryCode => {
                form.setFieldValue('country', countryCode);
            });
        }
    }
    isLoading.value = false;
}

onMounted(() => {
    loadData();
    loadLeafletCDN(true);
})



const isDialogOpen = ref(false);
const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);

async function onSubmit(values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        isDialogOpen.value = true;
        console.log('values', values);
        // values.address1, form.values.country?.toLowerCase()
        // mapLocation.value.address = values.address1;
        // mapLocation.value.country = values.country.toLowerCase();
    })
}

async function onMapConfirm(result: { lat: number, lng: number }) {
    isDialogOpen.value = false;
    // console.log('mapLocation', mapLocation.value);
    isLoading.value = true;
    // const reverseGeocodeResult = await reverseGeocode(lat, lng);
    // console.log('reverseGeocodeResult', reverseGeocodeResult);
    const { data, error } = await (await apiClient.dashboard.store[':storeId'].address.update.$patch({
        param: {
            storeId: currentStoreId.value ?? '',
        },
        json: {
            ...form.values,
            lat: result.lat,
            lng: result.lng,
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
    lat = result.lat;
    lng = result.lng;
    await loadMyStores();
}

const address1Label = ref('Street address (Address 1)');
const address2Label = ref('Apt, suite, unit, building, floor, etc. (Address 2)');
const hideAddress2Label = ref(false);
const addressStateLabel = ref('State/Province/Territory');
const addressCityLabel = ref('City');
const addressPostalCodeLabel = ref('Postcode/Zip');

watch(() => form.values.country, (newCountry) => {
    if (newCountry === 'US') {
        address1Label.value = 'Street address';
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
        address1Label.value = 'Street address (Address 1)';
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
            <GeolocationMap :address="form.values.address1!"
                            :country="form.values.country!"
                            :lat="lat!"
                            :lng="lng!"
                            @done="onMapConfirm"
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
            <!-- <DialogFooter>
                <Button type="button"
                        @click="onMapConfirm"
                        :disabled="isLoading"
                        class="w-full my-6">
                    <Loader2 v-if="isLoading"
                             class="animate-spin" />
                    Save
                </Button>
            </DialogFooter> -->
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
                Set location
                <MapPin />
            </Button>
        </div>
    </AutoForm>
</template>