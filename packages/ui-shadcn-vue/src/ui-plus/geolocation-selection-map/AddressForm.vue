<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ChevronRight, DoorOpen } from "lucide-vue-next";
import { AutoForm } from '@/ui-plus/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from "zod";
import { useFormPlus } from '@/ui-plus/form/useFormPlus'
import { Loader2 } from 'lucide-vue-next'
import AutoFormFieldCountry from '@/ui-plus/auto-form/AutoFormFieldCountry.vue'
import { onMounted, ref } from 'vue';
import GeolocationMap from '@/ui-plus/geolocation-selection-map/GeolocationMap.vue';
import { GeoLocation } from '@/ui-plus/geolocation-selection-map/types';
import { loadLeafletCDN } from '@/ui-plus/geolocation-selection-map/loadLeafletCDN';

const schema = z.object({
    country: z.string().min(1, 'Address is required'),
    address1: z.string().min(1, 'Address is required'),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})


const loadData = async () => {
    console.log('loadData', form.values.country);
}

onMounted(() => {
    loadData();
    loadLeafletCDN(true);
})

const isDialogOpen = ref(false);
const { isLoading, globalError, handleError, withSubmit } = useFormPlus(form, {
    persistenceFields: {
        country: "REMEMBER_LAST_COUNTRY",
        address1: "REMEMBER_LAST_ADDRESS1",
    }
});
const mapLocation = ref<GeoLocation>({
    lat: undefined,
    lng: undefined,
    address: undefined,
    country: undefined,
});

async function onSubmit(values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        isDialogOpen.value = true;
        console.log('values', values);
        // values.address1, form.values.country?.toLowerCase()
        mapLocation.value.address = values.address1;
        mapLocation.value.country = values.country.toLowerCase();
    })
}

async function onMapConfirm() {
    isDialogOpen.value = false;
    // console.log('mapLocation', mapLocation.value);
    isLoading.value = true;
    console.log('mapLocation', mapLocation.value);
    isLoading.value = false;
}

</script>

<template>

    <Dialog v-model:open="isDialogOpen">
        <DialogContent
                       class="flex h-full min-h-full min-w-full flex-col p-0 sm:p-2 md:h-[70vh] md:min-h-[70vh] md:min-w-[80vw] lg:min-w-[50vw]">
            <DialogHeader>
                <DialogTitle class="flex items-center gap-2">
                    <DoorOpen />
                    Confirm your entrance/door location
                </DialogTitle>
            </DialogHeader>
            <GeolocationMap v-model="mapLocation"
                            class="flex-1 overflow-hidden" />
            <DialogFooter>
                <Button type="button"
                        @click="onMapConfirm"
                        :disabled="isLoading"
                        class="w-full my-6">
                    <Loader2 v-if="isLoading"
                             class="animate-spin" />
                    Save
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <AutoForm class="space-y-6"
              :schema="schema"
              :field-config="{
                country: {
                    component: AutoFormFieldCountry,
                    hideLabel: true,
                    inputProps: {
                    },
                },
                address1: {
                    hideLabel: true,
                    inputProps: {
                        placeholder: 'Enter your address',
                        autocomplete: 'street-address',
                    },
                },
            }"
              :form="form"
              @submit="onSubmit">

        <div class="text-sm font-medium text-destructive"
             v-if="globalError">
            {{ globalError }}
        </div>
        <div>
            <Button type="submit"
                    :disabled="isLoading"
                    class="w-full my-6">
                <Loader2 v-if="isLoading"
                         class="animate-spin" />
                Order now
                <ChevronRight />
            </Button>
        </div>
    </AutoForm>
</template>