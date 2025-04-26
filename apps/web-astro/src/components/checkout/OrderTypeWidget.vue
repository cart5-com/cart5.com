<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { currentOrderType, setCurrentOrderType } from "../../stores/UserData.store";

const offersDelivery = window.storeData?.offersDelivery ?? false;
const offersPickup = window.storeData?.offersPickup ?? false;

</script>

<template>
    <div class="bg-muted text-muted-foreground my-4  w-fit flex items-center justify-center rounded-lg p-1">
        <Button variant="ghost"
                @click="setCurrentOrderType('delivery')"
                v-if="offersDelivery || currentOrderType === 'delivery'"
                :disabled="!offersDelivery"
                :class="currentOrderType === 'delivery' ? 'bg-background text-foreground shadow hover:bg-background/80' : ''">
            Delivery
        </Button>
        <Button variant="ghost"
                @click="setCurrentOrderType('pickup')"
                v-if="offersPickup || currentOrderType === 'pickup'"
                :disabled="!offersPickup"
                :class="currentOrderType === 'pickup' ? 'bg-background text-foreground shadow hover:bg-background/80' : ''">
            Pickup
        </Button>
    </div>
</template>