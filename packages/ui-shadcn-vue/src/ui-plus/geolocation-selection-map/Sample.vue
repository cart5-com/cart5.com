<!-- <script setup lang="ts">
import { ref } from 'vue';
import GeolocationSelectionMap from './GeolocationSelectionMap.vue';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    // DialogTrigger
} from "@/components/ui/dialog";
import { DoorOpen } from "lucide-vue-next";

const mapComp = ref();
const address = ref<string>('hello');
const isDialogOpen = ref(false);

const setAddress = () => {
    isDialogOpen.value = true;
    setTimeout(async () => {
        // 43.646294506256936, -79.38741027876338
        mapComp.value.address = 'sample address';
        mapComp.value.mapView.setView([43.646294506256936, -79.38741027876338], 18);
        mapComp.value.helperBtns = [
            {
                label: 'park',
                lat: 43.646294506256936,
                lng: -79.38741027876338
            }
        ];
    }, 100);
}

function onMapConfirm() {
    const { lat, lng } = mapComp.value?.mapView.getCenter();
    console.log("address", {
        description: address.value,
    });
    console.log("coordinates", {
        lat,
        lng
    });
    isDialogOpen.value = false;
}
</script>

<template>
    <div>
        <div>
            <Dialog v-model:open="isDialogOpen">

                <!-- <DialogTrigger>
                 <Button variant="outline"> OPEN MAP </Button>
             </DialogTrigger> -->
                <DialogContent class="flex h-full min-h-full min-w-full flex-col p-0 sm:p-2 md:h-[70vh] md:min-h-[70vh] md:min-w-[80vw] lg:min-w-[50vw]"
                               @interact-outside="(event) => {
                                const target = event.target as HTMLElement;
                                if (target?.closest('[data-sonner-toaster]')) return event.preventDefault();
                            }
                                ">
                    <DialogHeader>
                        <DialogTitle class="flex items-center gap-2">
                            <DoorOpen />
                            Confirm your entrance/door location
                        </DialogTitle>
                        <DialogDescription class="hidden text-sm sm:block">
                            Move the map to your entrance/door and click Confirm
                        </DialogDescription>
                    </DialogHeader>
                    <GeolocationSelectionMap ref="mapComp"
                                             class="flex-1 overflow-hidden" />
                    <!-- <div class="grid gap-4 py-4">
                     <div class="grid grid-cols-4 items-center gap-4">
                         <Label for="name" class="text-right"> Name </Label>
                         <Input id="name" value="Pedro Duarte" class="col-span-3" />
                     </div>
                     <div class="grid grid-cols-4 items-center gap-4">
                         <Label for="username" class="text-right"> Username </Label>
                         <Input id="username" value="@peduarte" class="col-span-3" />
                     </div>
                 </div>
                 -->
                    <DialogFooter>
                        <Button @click="onMapConfirm"
                                class="w-full"
                                type="button"> Confirm </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <input v-model="address" />
            <Button @click="setAddress">Set Address</Button>
        </div>
    </div>


</template> -->
