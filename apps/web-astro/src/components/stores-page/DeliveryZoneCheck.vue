<script setup lang="ts">
// TODO: remove this we do not need vue for this!
import { onMounted, computed } from "vue";
import { getBestDeliveryZone } from "@lib/utils/getBestDeliveryZone";
import { TriangleAlert } from "lucide-vue-next";
import { userDataStore } from "../../stores/UserData.store";

const props = defineProps<{
    storeId?: string;
}>();

let zoneData: any;

const bestDeliveryZone = computed(() => {
    return getBestDeliveryZone(
        {
            lat: userDataStore.value.userData?.rememberLastLat!,
            lng: userDataStore.value.userData?.rememberLastLng!
        },
        zoneData?.deliveryZones?.zones ?? [],
        {
            lat: zoneData?.address?.lat!,
            lng: zoneData?.address?.lng!
        }
    );
})

onMounted(async () => {
    try {
        const jsonUrl = `https://${import.meta.env.PUBLIC_CLOUDFLARE_R2_PUBLIC_HOST}/store-data-delivery-zones-and-address/${props.storeId}.json`;
        zoneData = await (await fetch(jsonUrl)).json();
    } catch (e) {
        // ignore error
        // console.error(e);
    }
});
</script>

<template>
    <span v-if="!bestDeliveryZone"
          class="bg-destructive text-destructive-foreground rounded-md px-2 py-1 text-xs">
        <TriangleAlert class="mr-1 inline-block" />
        Outside delivery zone
    </span>
</template>