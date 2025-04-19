<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { userDataStore, handleDataChangeNow } from "@web-astro/stores/UserData.store";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Home, Plus, Edit, Trash2 } from "lucide-vue-next";
import { type AddressType } from "@lib/zod/userAddressSchema";
import { AutoForm } from "@/ui-plus/auto-form";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";
import { useFormPlus } from "@/ui-plus/form/useFormPlus";
import { toast } from "@/ui-plus/sonner";
import AutoFormFieldCountry from "@/ui-plus/auto-form/AutoFormFieldCountry.vue";
import AutoFormFieldIcon from "@/ui-plus/auto-form/AutoFormFieldIcon.vue";
import { fetchCountryCode } from "@/ui-plus/PhoneNumber/basePhoneInput/helpers/use-phone-input";
import { DependencyType } from "@/ui-plus/auto-form/interface";
import GeolocationMap from "@/ui-plus/geolocation-selection-map/GeolocationMap.vue";
import { loadLeafletCDN } from "@/ui-plus/geolocation-selection-map/loadLeafletCDN";
import { MapPin, House, Building, Hotel, Bed, Factory, BriefcaseBusiness, School, University, Landmark, Store, Castle, Hospital } from 'lucide-vue-next'

const icons = [
    { name: 'MapPin', component: MapPin },
    { name: 'House', component: House },
    { name: 'Building', component: Building },
    { name: 'Hotel', component: Hotel },
    { name: 'Bed', component: Bed },
    { name: 'Factory', component: Factory },
    { name: 'BriefcaseBusiness', component: BriefcaseBusiness },
    { name: 'School', component: School },
    { name: 'University', component: University },
    { name: 'Landmark', component: Landmark },
    { name: 'Store', component: Store },
    { name: 'Castle', component: Castle },
    { name: 'Hospital', component: Hospital }
]

// State
const isFormDialogOpen = ref(false);
const isMapDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const currentAddressId = ref<string | null>(null);
const lat = ref<number | null>(null);
const lng = ref<number | null>(null);
const confirmDeleteId = ref<string | null>(null);

// Computed properties
const addresses = computed(() => {
    return userDataStore.value?.userData?.addresses || {};
});

const addressesArray = computed(() => {
    return Object.entries(addresses.value).map(([id, address]) => ({
        id,
        ...(address as AddressType),
    }));
});

// Form setup
const schema = z.object({
    country: z.string().min(1, "Required"),
    address1: z.string().min(1, "Required"),
    address2: z.string().optional(),
    city: z.string().min(1, "Required"),
    state: z.string().optional(),
    postalCode: z.string().min(1, "Postal code is required"),
    instructionsForDelivery: z.string().optional(),
    label: z.string().optional(),
    icon: z.string().optional(),
});

const form = useForm({
    validationSchema: toTypedSchema(schema),
});

const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form);

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

// Methods
function openAddForm() {
    resetForm();
    currentAddressId.value = null;
    isFormDialogOpen.value = true;
    form.setFieldValue('icon', 'MapPin');
    // Set default country
    fetchCountryCode().then(countryCode => {
        form.setFieldValue('country', countryCode);
    });
}

function openEditForm(addressId: string) {
    const address = addresses.value[addressId];
    if (!address) return;

    resetForm();
    currentAddressId.value = addressId;

    for (const key in address) {
        const typedKey = key as keyof typeof schema.shape;
        if (address[typedKey as keyof typeof address]) {
            if (typeof address[typedKey as keyof typeof address] === 'string') {
                form.setFieldValue(typedKey, address[typedKey as keyof typeof address] as string);
            }
        }
    }

    lat.value = address.lat || null;
    lng.value = address.lng || null;

    isFormDialogOpen.value = true;
}

function resetForm() {
    form.resetForm();
    lat.value = null;
    lng.value = null;
}

function openDeleteConfirmation(addressId: string) {
    confirmDeleteId.value = addressId;
    isDeleteDialogOpen.value = true;
}

async function deleteAddress() {
    if (!confirmDeleteId.value || !userDataStore.value?.userData?.addresses) return;

    try {
        const newAddresses = { ...userDataStore.value.userData.addresses };
        delete newAddresses[confirmDeleteId.value];

        if (userDataStore.value.userData) {
            userDataStore.value.userData.addresses = newAddresses;
            await handleDataChangeNow(userDataStore.value);
        }

        toast.success("Address deleted successfully");
        isDeleteDialogOpen.value = false;
        confirmDeleteId.value = null;
    } catch (error) {
        console.error("Error deleting address:", error);
        toast.error("Failed to delete address");
    }
}

async function onFormSubmit(_values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        if (!lat.value || !lng.value) {
            isMapDialogOpen.value = true;
        } else {
            await saveAddress();
        }
    });
}

async function onMapConfirm(result: { lat: number; lng: number }) {
    isMapDialogOpen.value = false;
    lat.value = result.lat;
    lng.value = result.lng;
    await saveAddress();
}

async function saveAddress() {
    try {
        if (!userDataStore.value.userData) {
            userDataStore.value.userData = { addresses: {} } as any;
        }

        if (!userDataStore.value.userData?.addresses) {
            userDataStore.value.userData!.addresses = {};
        }

        const addressId = currentAddressId.value || crypto.randomUUID();
        const addressData: AddressType = {
            addressId,
            country: form.values.country || '',
            address1: form.values.address1 || '',
            city: form.values.city || '',
            state: form.values.state,
            postalCode: form.values.postalCode,
            address2: form.values.address2,
            lat: lat.value || undefined,
            lng: lng.value || undefined,
            instructionsForDelivery: form.values.instructionsForDelivery,
            label: form.values.label,
            icon: form.values.icon || 'MapPin'
        };

        userDataStore.value.userData!.addresses[addressId] = addressData;
        await handleDataChangeNow(userDataStore.value);

        toast.success(currentAddressId.value ? "Address updated" : "Address added");
        isFormDialogOpen.value = false;
    } catch (error) {
        console.error("Error saving address:", error);
        toast.error("Failed to save address");
    }
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
    loadLeafletCDN(true);
});
</script>

<template>
    <div class="space-y-4">
        <!-- Header with Add button -->
        <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">My Addresses</h2>
            <Button @click="openAddForm"
                    class="flex items-center gap-1">
                <Plus class="h-4 w-4" /> Add Address
            </Button>
        </div>

        <!-- Address Cards -->
        <div v-if="addressesArray.length > 0"
             class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card v-for="address in addressesArray"
                  :key="address.id"
                  class="relative">
                <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                        <component :is="icons.find(i => i.name === address.icon)?.component || MapPin" />
                        {{ address.label || `${address.address1} ${address.address2}` }}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-sm space-y-1">
                        <p>{{ address.address1 }}</p>
                        <p v-if="address.address2">{{ address.address2 }}</p>
                        <p>{{ address.city }}{{ address.state ? `, ${address.state}` : '' }}</p>
                        <p>{{ address.postalCode }}</p>
                        <p>{{ address.country }}</p>
                        <p v-if="address.instructionsForDelivery"
                           class="mt-1 text-muted-foreground">
                            Instructions: {{ address.instructionsForDelivery }}
                        </p>
                    </div>
                </CardContent>
                <CardFooter class="flex justify-end gap-2">
                    <Button variant="outline"
                            size="sm"
                            @click="openEditForm(address.id)">
                        <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="destructive"
                            size="sm"
                            @click="openDeleteConfirmation(address.id)">
                        <Trash2 class="h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>

        <!-- Empty state -->
        <div v-else
             class="p-8 text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Home class="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 class="text-lg font-semibold">No addresses yet</h3>
            <p class="mt-2 text-sm text-muted-foreground">Add your first address to get started.</p>
            <Button @click="openAddForm"
                    class="mt-4">Add Address</Button>
        </div>

        <!-- Form Dialog -->
        <Dialog v-model:open="isFormDialogOpen">
            <DialogContent class="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{{ currentAddressId ? 'Edit Address' : 'Add New Address' }}</DialogTitle>
                </DialogHeader>
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
                    <div class="text-sm font-medium text-destructive"
                         v-if="globalError">
                        {{ globalError }}
                    </div>
                    <DialogFooter>
                        <Button type="button"
                                variant="outline"
                                @click="isFormDialogOpen = false"
                                :disabled="isLoading">
                            Cancel
                        </Button>
                        <Button type="submit"
                                :disabled="isLoading">
                            <Loader2 v-if="isLoading"
                                     class="mr-2 h-4 w-4 animate-spin" />
                            {{ currentAddressId ? 'Update' : 'Save' }}
                        </Button>
                    </DialogFooter>
                </AutoForm>
            </DialogContent>
        </Dialog>

        <!-- Map Dialog -->
        <Dialog v-model:open="isMapDialogOpen">
            <DialogContent
                           class="flex h-full min-h-full min-w-full flex-col p-0 sm:p-2 md:h-[70vh] md:min-h-[70vh] md:min-w-[80vw] lg:min-w-[50vw]">
                <DialogHeader>
                    <DialogTitle class="flex items-center gap-2">
                        <MapPin />
                        Confirm address location
                    </DialogTitle>
                </DialogHeader>
                <GeolocationMap :address="form.values.address1!"
                                :country="form.values.country!"
                                :lat="lat!"
                                :lng="lng!"
                                @done="onMapConfirm"
                                class="flex-1 overflow-hidden" />
            </DialogContent>
        </Dialog>

        <!-- Delete Confirmation Dialog -->
        <Dialog v-model:open="isDeleteDialogOpen">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Address</DialogTitle>
                </DialogHeader>
                <div class="py-4">
                    <p>Are you sure you want to delete this address? This action cannot be undone.</p>
                </div>
                <DialogFooter>
                    <Button variant="outline"
                            @click="isDeleteDialogOpen = false">Cancel</Button>
                    <Button variant="destructive"
                            @click="deleteAddress">Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>