<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { isUserDataReady, ON_USER_DATA_READY, orderCurrentType, setOrderCurrentType } from "../../stores/UserData.store";
import { onMounted } from "vue";

const offersDelivery = window.storeData?.offersDelivery ?? false;
const offersPickup = window.storeData?.offersPickup ?? false;

const handleUserDataReady = () => {
    if (orderCurrentType.value === "pickup" && !offersPickup) {
        setOrderCurrentType("delivery");
    } else if (orderCurrentType.value === "delivery" && !offersDelivery) {
        setOrderCurrentType("pickup");
    }
}

onMounted(() => {
    if (isUserDataReady) {
        // User data is ready, so we can check the store status
        handleUserDataReady();
    } else {
        // User data is not ready, so we need to wait for it
        window.addEventListener(ON_USER_DATA_READY, handleUserDataReady);
    }
})

</script>

<template>
    <div class="bg-muted text-muted-foreground my-4 grid w-fit grid-cols-2 items-center justify-center rounded-lg p-1">
        <Button variant="ghost"
                @click="setOrderCurrentType('delivery')"
                :disabled="!offersDelivery"
                :class="orderCurrentType === 'delivery' ? 'bg-background text-foreground shadow hover:bg-background/80' : ''">
            Delivery
        </Button>
        <Button variant="ghost"
                @click="setOrderCurrentType('pickup')"
                :disabled="!offersPickup"
                :class="orderCurrentType === 'pickup' ? 'bg-background text-foreground shadow hover:bg-background/80' : ''">
            Pickup
        </Button>
    </div>
</template>