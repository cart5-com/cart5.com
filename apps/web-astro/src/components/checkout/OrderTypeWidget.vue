<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { orderCurrentType, setOrderCurrentType } from "../../stores/UserData.store";

const offersDelivery = window.storeData?.offersDelivery ?? false;
const offersPickup = window.storeData?.offersPickup ?? false;

</script>

<template>
    <div class="bg-muted text-muted-foreground my-4  w-fit flex items-center justify-center rounded-lg p-1">
        <Button variant="ghost"
                @click="setOrderCurrentType('delivery')"
                v-if="offersDelivery || orderCurrentType === 'delivery'"
                :disabled="!offersDelivery"
                :class="orderCurrentType === 'delivery' ? 'bg-background text-foreground shadow hover:bg-background/80' : ''">
            Delivery
        </Button>
        <Button variant="ghost"
                @click="setOrderCurrentType('pickup')"
                v-if="offersPickup || orderCurrentType === 'pickup'"
                :disabled="!offersPickup"
                :class="orderCurrentType === 'pickup' ? 'bg-background text-foreground shadow hover:bg-background/80' : ''">
            Pickup
        </Button>
    </div>
</template>