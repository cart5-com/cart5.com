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
import { computed, onMounted } from 'vue';

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

const dialog = useDialog();

const addresses = computed(() => {
    return userDataStore.value.userData?.addresses || {};
});


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

function editAddress(address: AddressType) {
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

function deleteAddress(addressId: string) {
    if (userDataStore.value.userData?.addresses) {
        delete userDataStore.value.userData.addresses[addressId];
    }
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
             class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card v-for="address in Object.values(addresses)"
                  :key="address.addressId"
                  class="shadow-sm">
                <CardHeader class="pb-2">
                    <CardTitle class="flex items-center gap-2 text-base">
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
                        </div>
                        <div>{{ address.country }}</div>
                        <div v-if="address.instructionsForDelivery"
                             class="mt-2 italic">
                            {{ address.instructionsForDelivery }}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <div class="flex gap-2">
                        <Button variant="ghost"
                                size="sm"
                                @click="editAddress(address)">
                            <Pencil class="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        <Button variant="ghost"
                                size="sm"
                                @click="deleteAddress(address.addressId)">
                            <Trash2 class="h-4 w-4 mr-1" />
                            Delete
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    </div>
</template>