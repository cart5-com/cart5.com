<script setup lang="ts">
import { onMounted, ref } from 'vue';
import GeolocationSelectionMap from './GeolocationSelectionMap.vue';
import { Input } from '@/components/ui/input';

const mapComp = ref<InstanceType<typeof GeolocationSelectionMap>>();
const address = ref<string>('hello');
const isDialogOpen = ref(false);

const setAddress = () => {
    isDialogOpen.value = true;
    setTimeout(async () => {
        // 43.646294506256936, -79.38741027876338
        if (!mapComp.value) return;
        if (!mapComp.value.mapView) return;
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

onMounted(() => {
    setAddress();
});

</script>

<template>
    <div>
        <div class="h-[400px] w-[400px] m-4">
            <GeolocationSelectionMap ref="mapComp"
                                     class="flex-1 overflow-hidden"
                                     :address="address" />
        </div>
        <div class="flex flex-col gap-2">
            <label for="address">Address</label>
            <Input id="address"
                   v-model="address" />
        </div>
    </div>


</template>
