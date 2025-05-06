<script setup lang="ts">
import { BASE_LINKS } from "@web-astro/utils/links";
import { slugify } from "@lib/utils/slugify";
import { User, Pencil, MapPinOff } from "lucide-vue-next";
import { Card, CardContent } from "@/components/ui/card";
import { currentOrderType, userDataStore } from "@web-astro/stores/UserData.store";
import { computed } from "vue";
import { MapPin, House, Building, Hotel, Bed, Factory, BriefcaseBusiness, School, University, Landmark, Store, Castle, Warehouse, Hospital } from 'lucide-vue-next'
// import MapEmbed from "@web-astro/components/MapEmbed.vue";

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
    { name: 'Warehouse', component: Warehouse },
    { name: 'Hospital', component: Hospital }
]

const selectedAddress = computed(() => {
    const addressId = userDataStore.value.userData?.rememberLastAddressId;
    if (addressId && userDataStore.value.userData?.addresses) {
        return userDataStore.value.userData.addresses[addressId] || null;
    }
    return null;
});

const pickupNickname = computed(() => {
    return userDataStore.value.userData?.rememberLastNickname || userDataStore.value.user?.name || 'unknown';
});

const storeId = window.storeData?.id;
const storeName = window.storeData?.name;
const storeLocationLat = window.storeData?.address.lat;
const storeLocationLng = window.storeData?.address.lng;

// // watch for case (currentOrderType === 'delivery' && !selectedAddress)
// watch(() => currentOrderType.value === 'delivery' && !selectedAddress.value, () => {
//     toast.error('Please add or select an address');
//     setTimeout(() => {
//         window.location.href = BASE_LINKS.CONFIRM_INFO(storeId!, slugify(storeName!));
//     }, 1000);
// });

defineExpose({
    selectedAddress,
    pickupNickname
})
</script>

<template>
    <div>
        <a :href="BASE_LINKS.CONFIRM_INFO(storeId!, slugify(storeName!))">
            <!-- <div v-if="storeLocationLat && storeLocationLng"
                 class="mt-3 overflow-hidden rounded-lg">
                <MapEmbed :storeLat="storeLocationLat"
                          :storeLng="storeLocationLng"
                          :destinationLat="currentOrderType === 'delivery' ? selectedAddress?.lat : undefined"
                          :destinationLng="currentOrderType === 'delivery' ? selectedAddress?.lng : undefined"
                          :isLink="false" />
            </div> -->
            <Card class="my-4 hover:bg-card/80">
                <CardContent class="p-4">
                    <div v-if="currentOrderType === 'delivery' && selectedAddress">
                        <h3 class="font-bold text-xl mb-2">Delivery details</h3>
                        <div class="flex items-start gap-2 justify-between">
                            <div class="flex items-start gap-2 ">
                                <component
                                           :is="icons.find(icon => icon.name === selectedAddress?.icon)?.component || MapPin" />
                                <div>
                                    <h3 class="font-medium">{{ selectedAddress.label }}</h3>
                                    <p class="text-sm font-bold">{{ selectedAddress.address1 }}</p>
                                    <p v-if="selectedAddress.address2"
                                       class="text-sm font-bold">{{ selectedAddress.address2 }}</p>
                                    <p class="text-sm font-bold">
                                        {{ [selectedAddress.city, selectedAddress.state].filter(Boolean).join(', ') }}
                                        {{ selectedAddress.postalCode }}
                                    </p>
                                    <p v-if="selectedAddress.instructionsForDelivery"
                                       class="text-sm italic mt-1">
                                        {{ selectedAddress.instructionsForDelivery }}
                                    </p>
                                </div>
                            </div>
                            <Pencil class="inline-block ml-2" />
                        </div>
                    </div>
                    <div v-else-if="currentOrderType === 'delivery' && !selectedAddress">
                        <div class="p-2 bg-destructive text-destructive-foreground rounded-md">
                            <MapPinOff class="mr-1 inline-block" />
                            Missing address click here to add or select an address
                        </div>
                    </div>
                    <div v-else-if="currentOrderType === 'pickup' && pickupNickname">
                        <h3 class="font-bold text-xl mb-2">Pickup details</h3>
                        <div class="flex items-start gap-2 justify-between">
                            <div class="flex items-start gap-2">
                                <User class="" />
                                <div>
                                    <h3 class="font-medium">Pickup Name/Nickname: {{ pickupNickname }}</h3>
                                </div>
                            </div>
                            <Pencil class="inline-block ml-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </a>
    </div>
</template>