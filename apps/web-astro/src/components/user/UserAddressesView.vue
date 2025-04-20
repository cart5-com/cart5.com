<script setup lang="ts">
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import UserAddressForm from './UserAddressForm.vue';
import { userDataStore } from '@web-astro/stores/UserData.store';
import type { AddressType } from '@lib/zod/userAddressSchema';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Pencil,
    Trash2,
    PlusCircle,
} from 'lucide-vue-next';
import { MapPin, House, Building, Hotel, Bed, Factory, BriefcaseBusiness, School, University, Landmark, Store, Castle, Hospital } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue';

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

// google maps embed api key
const GOOGLE_MAPS_EMBED_API_KEY = "AIzaSyDfZRiObEgFLQXUc5l8SEV7Mrxc5e001bQ"; //Maps Embed API has unlimited free use

const dialog = useDialog();

const addresses = computed(() => {
    return userDataStore.value.userData?.addresses || {};
});

const selectedAddressId = computed(() => {
    return userDataStore.value.userData?.rememberLastAddressId || '';
});

function selectAddress(address: AddressType) {
    userDataStore.value.userData!.rememberLastAddressId = address.addressId;
    console.log('Selected address:', address.addressId);
}

function newAddress() {
    dialog.show<AddressType>({
        title: 'Add Address',
        component: UserAddressForm,
        props: {
            address: {
                country: userDataStore.value.userData?.rememberLastCountry || '',
                address1: userDataStore.value.userData?.rememberLastAddress || '',
                lat: userDataStore.value.userData?.rememberLastLat || 0,
                lng: userDataStore.value.userData?.rememberLastLng || 0,
            },
        },
        onSuccess: (address) => {
            if (!userDataStore.value.userData?.addresses) {
                userDataStore.value.userData!.addresses = {};
            }
            userDataStore.value.userData!.addresses![address.addressId] = address;
            userDataStore.value.userData!.rememberLastAddressId = address.addressId;
            userDataStore.value.userData!.rememberLastAddress = address.address1;
            userDataStore.value.userData!.rememberLastCountry = address.country;
            userDataStore.value.userData!.rememberLastLat = address.lat || null;
            userDataStore.value.userData!.rememberLastLng = address.lng || null;
        }
    })
}

function editAddress(address: AddressType, event: Event) {
    event.stopPropagation();
    dialog.show<AddressType>({
        title: 'Edit Address',
        component: UserAddressForm,
        props: {
            address,
        },
        onSuccess: (updatedAddress) => {
            if (!userDataStore.value.userData?.addresses) {
                userDataStore.value.userData!.addresses = {};
            }
            userDataStore.value.userData!.addresses![updatedAddress.addressId] = updatedAddress;
        }
    });
}

function deleteAddress(addressId: string, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this address?')) {
        if (userDataStore.value.userData?.addresses) {
            delete userDataStore.value.userData.addresses[addressId];
        }
    }
}

function getMapUrl(address: AddressType): string {
    if (address.lat && address.lng) {
        // return `https://www.google.com/maps/embed/v1/directions?` +
        //     `key=${GOOGLE_MAPS_EMBED_API_KEY}&destination=${address.lat},${address.lng}` +
        //     `&origin=${window.storeData?.address?.lat},${window.storeData?.address?.lng}`;
        return `https://www.google.com/maps/embed/v1/place?` +
            `key=${GOOGLE_MAPS_EMBED_API_KEY}&q=${address.lat},${address.lng}&zoom=17`;
    }
    return '';
}

onMounted(() => {
    setTimeout(() => {
        if (!userDataStore.value.userData?.addresses || Object.keys(userDataStore.value.userData?.addresses).length === 0) {
            newAddress();
        }
    }, 1000);
})
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">My Addresses</h3>
            <Button variant="outline"
                    size="sm"
                    @click="newAddress">
                <PlusCircle class="h-4 w-4 mr-2" />
                Add Address
            </Button>
        </div>

        <div v-if="Object.keys(addresses).length === 0"
             class="text-center py-6">
            <p class="text-muted-foreground">No addresses added yet</p>
        </div>

        <div v-else
             class="grid grid-cols-1 gap-4">
            <Card v-for="address in Object.values(addresses)"
                  :key="address.addressId"
                  class="shadow-sm transition-all cursor-pointer"
                  :class="{ 'ring-2 ring-primary': selectedAddressId === address.addressId }"
                  @click="selectAddress(address)">
                <CardHeader class="pb-2">
                    <CardTitle class="flex items-center gap-2 text-base"
                               :class="{ 'text-primary': selectedAddressId === address.addressId }">
                        <component :is="icons.find(icon => icon.name === address.icon)?.component || MapPin"
                                   class="h-4 w-4" />
                        {{ address.label || 'Address' }}
                    </CardTitle>
                </CardHeader>
                <CardContent class="pb-2">
                    <div class="text-sm text-muted-foreground">
                        <div>{{ address.address1 }}</div>
                        <div v-if="address.address2">{{ address.address2 }}</div>
                        <div>
                            {{ [address.city, address.state].filter(Boolean).join(', ') }}
                            {{ address.postalCode }}
                            {{ address.country }}
                        </div>
                        <div v-if="address.instructionsForDelivery"
                             class="mt-2 italic">
                            {{ address.instructionsForDelivery }}
                        </div>
                    </div>

                    <!-- Google Map for address with coordinates -->
                    <div v-if="address.lat && address.lng"
                         class="mt-3 overflow-hidden rounded-lg">
                        <iframe width="100%"
                                height="1500"
                                class="rounded-lg"
                                frameborder="0"
                                style="border:0; pointer-events: none; zoom: 0.1; transform: scale(10);
transform-origin: center center;"
                                referrerpolicy="no-referrer-when-downgrade"
                                allowfullscreen="false"
                                :src="getMapUrl(address)">
                        </iframe>
                    </div>
                </CardContent>
                <CardFooter>
                    <div class="flex gap-2">
                        <Button variant="outline"
                                size="sm"
                                @click="(e) => editAddress(address, e)">
                            <Pencil class="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        <Button variant="destructive"
                                size="sm"
                                @click="(e) => deleteAddress(address.addressId, e)">
                            <Trash2 class="h-4 w-4 mr-1" />
                            Delete
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    </div>
</template>