<script setup lang="ts">
import { Printer } from 'lucide-vue-next';
import LayoutHelpers from "@/ui-plus/LayoutHelpers.vue";
import Dropdown from "./components/Dropdown.vue";
import { Button } from "@/components/ui/button";
import { onClickPairDevice, stopPairing, isPairing, pairingCode } from "./pairing";
import CopyButton from "@/ui-plus/CopyButton.vue";
import { isPairedBefore } from "./stores/isPairedBefore";
import { globalErrorText } from "./stores/globalErrorText";
import { currentPrinters } from "./stores/currentPrinters";

</script>

<template>
    <div class="p-4 space-y-8">
        <h1 class="text-3xl font-bold py-2">
            <Dropdown />
            Auto Print
            <Printer class="inline-block ml-2" />
        </h1>
        <div class="mb-4 bg-destructive text-destructive-foreground rounded-md p-4 font-bold"
             v-if="!isPairedBefore">
            This device is not paired with any store.
            <br>
            Please pair with a store to print orders as they come in.
        </div>
        <div class="mb-4 bg-destructive text-destructive-foreground rounded-md p-4 font-bold"
             v-if="globalErrorText">
            {{ globalErrorText }}
        </div>
        <div class="border rounded-lg p-4 border-foreground">
            <p class="text-sm text-muted-foreground">
                (you may pair with multiple stores if needed)
            </p>
            <Button @click="onClickPairDevice"
                    variant="secondary"
                    v-if="!isPairing">
                Pair with a new store
            </Button>
            <Button @click="stopPairing"
                    variant="outline"
                    v-else>
                Stop pairing
            </Button>
            <br>
            <div v-if="pairingCode && isPairing"
                 class="mt-8">
                one-time-pairing-code:
                <br>
                <CopyButton :content="pairingCode"
                            class="mt-2">
                    <span class="text-3xl font-bold">
                        {{ pairingCode }}
                    </span>
                </CopyButton>
                <br>
                <br>
                once asked to pair with a store, please paste the code above.
            </div>
        </div>
        <div class="border rounded-lg p-4 border-foreground">
            <p class="text-sm text-muted-foreground">
                Your printers
            </p>
            <ul class="list-disc list-inside">
                <li v-for="printer in currentPrinters"
                    :key="printer.deviceName">
                    {{ printer.deviceName }}
                </li>
            </ul>
            <p class="text-sm text-muted-foreground">
                These printers will become available for printing automations after pairing with a store.
            </p>
        </div>
        <LayoutHelpers />
    </div>
</template>