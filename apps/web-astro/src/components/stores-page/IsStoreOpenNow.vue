<script setup lang="ts">
// TODO: remove this we do not need vue for this!
import { Moon } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { isOpenNow } from "@lib/utils/isOpenNow";
import type { OrderType } from "@lib/types/orderType";

const props = defineProps<{
    storeId?: string;
    orderType?: OrderType;
}>();

const isOpen = ref(false);

// TODO: if bot browser show open
onMounted(async () => {
    try {
        const jsonUrl = `https://${import.meta.env.PUBLIC_CLOUDFLARE_R2_PUBLIC_HOST}/store-data-open-hours/${props.storeId}.json`;
        const json = await (await fetch(jsonUrl)).json();
        if (json) {
            const openHours = json;
            let weeklyHours = openHours?.defaultOpenHours;
            if (props.orderType === "delivery" && openHours?.deliveryHours?.isActive) {
                weeklyHours = openHours?.deliveryHours;
            } else if (props.orderType === "pickup" && openHours?.pickupHours?.isActive) {
                weeklyHours = openHours?.pickupHours;
            }
            isOpen.value = isOpenNow(openHours?.timezone ?? null, weeklyHours ?? null);
        }
    } catch (e) {
        // ignore error
        // console.error(e);
    }
    if (!isOpen.value) {
        document.querySelector(`#store-card-${props.storeId}`)?.classList.add("brightness-50");
    }
});
</script>

<template>
    <span v-if="!isOpen"
          class="bg-destructive text-destructive-foreground rounded-md px-2 py-1 text-xs">
        <Moon class="mr-1 inline-block" />
        Closed
    </span>
</template>