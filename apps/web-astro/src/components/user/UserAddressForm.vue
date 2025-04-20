<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AutoForm } from "@/ui-plus/auto-form";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";
import { useFormPlus } from "@/ui-plus/form/useFormPlus";
import AutoFormFieldCountry from "@/ui-plus/auto-form/AutoFormFieldCountry.vue";
import AutoFormFieldIcon from "@/ui-plus/auto-form/AutoFormFieldIcon.vue";
import { DependencyType } from "@/ui-plus/auto-form/interface";
import GeolocationMap from "@/ui-plus/geolocation-selection-map/GeolocationMap.vue";
import { loadLeafletCDN } from "@/ui-plus/geolocation-selection-map/loadLeafletCDN";
import { addressSchema, type AddressType } from "@lib/zod/userAddressSchema";
import { DoorOpen } from "lucide-vue-next";

const props = defineProps<{
    address?: Partial<AddressType>;
}>();

const emit = defineEmits<{
    close: [address: AddressType],
    cancel: [];
}>();

const isMapDialogOpen = ref(false);
const lat = ref<number | null>(props.address?.lat || null);
const lng = ref<number | null>(props.address?.lng || null);

// Form setup
const schema = addressSchema
    .omit({
        addressId: true,
        lat: true,
        lng: true,
        dropoffOption: true,
    })

const form = useForm({
    validationSchema: toTypedSchema(schema),
});

const { withSubmit } = useFormPlus(form);

// Form labels
const address1Label = ref('Street address (Address 1)');
const address2Label = ref('Apt, suite, unit, building, floor, etc. (Address 2)');
const hideAddress2Label = ref(false);
const addressStateLabel = ref('State/Province/Territory');
const addressCityLabel = ref('City');
const addressPostalCodeLabel = ref('Postcode/Zip');

// Countries that have states
const COUNTRIES_WITH_STATES = [
    'US', 'CA', 'AU', 'BR', 'IN', 'MX', 'AR', 'MY', 'ID', 'RU', 'CN', 'JP', 'DE',
    'ES', 'IT', 'GB', 'FR', 'PH', 'PK', 'NG', 'VN', 'ZA', 'TH', 'MM', 'KR', 'CO', 'VE'
];

// form.resetForm();
async function onFormSubmit(_values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        isMapDialogOpen.value = true;
    });
}

async function onMapConfirm(result: { lat: number; lng: number }) {
    isMapDialogOpen.value = false;
    lat.value = result.lat;
    lng.value = result.lng;

    // Make sure all required fields are included
    const completeAddress = {
        ...form.values,
        addressId: props.address?.addressId || crypto.randomUUID(),
        lat: lat.value,
        lng: lng.value,
    } as AddressType;

    emit('close', completeAddress);
}

// Watchers for form labels based on country
const updateFormLabels = (country: string) => {
    if (country === 'US') {
        address1Label.value = 'Street address';
        address2Label.value = 'Apt, suite, unit, building, floor, etc.';
        hideAddress2Label.value = true;
        addressCityLabel.value = 'City';
        addressStateLabel.value = 'State';
        addressPostalCodeLabel.value = 'Postcode';
    } else if (country === 'GB') {
        address1Label.value = 'Address line 1 (or company name)';
        address2Label.value = 'Address line 2 (optional)';
        addressCityLabel.value = 'Town/City';
        addressStateLabel.value = 'County (if applicable)';
        hideAddress2Label.value = false;
        addressPostalCodeLabel.value = 'Postcode';
    } else if (country === 'CA') {
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
};

// Watch for country changes
watch(() => form.values.country, (newCountry) => {
    if (newCountry) {
        updateFormLabels(newCountry);
    }
});

// Initialize Leaflet on component mount
onMounted(() => {
    form.setValues(props.address || {});
    loadLeafletCDN(true);
});
</script>

<template>
    <div>
        <AutoForm class="space-y-4"
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
                    },
                    icon: {
                        component: AutoFormFieldIcon,
                        label: 'Icon',
                    },
                    address1: {
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
                    },
                    label: {
                        label: 'Label (e.g. Home, Work)',
                        inputProps: {
                            placeholder: 'Optional name for this address',
                        },
                    },
                    instructionsForDelivery: {
                        component: 'textarea',
                        label: 'Delivery Instructions',
                        inputProps: {
                            placeholder: 'Buzzer code, landmark, etc.',
                        },
                    },
                }"
                  :form="form"
                  @submit="onFormSubmit">
            <Button type="submit">
                Save
            </Button>
        </AutoForm>

        <!-- Map Dialog -->
        <Dialog v-model:open="isMapDialogOpen">
            <DialogContent
                           class="flex h-full min-h-full min-w-full flex-col p-0 sm:p-2 md:h-[70vh] md:min-h-[70vh] md:min-w-[80vw] lg:min-w-[50vw]">
                <DialogHeader>
                    <DialogTitle class="flex items-center gap-2">
                        <DoorOpen />
                        Confirm building entrance/door location
                    </DialogTitle>
                </DialogHeader>
                <GeolocationMap :address="form.values.address1!"
                                :country="form.values.country!"
                                :lat="lat!"
                                :lng="lng!"
                                @done="onMapConfirm"
                                btn-label="Confirm"
                                class="flex-1 overflow-hidden" />
            </DialogContent>
        </Dialog>
    </div>
</template>