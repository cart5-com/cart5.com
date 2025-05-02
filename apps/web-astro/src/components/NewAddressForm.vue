<script setup lang="ts">
import { userDataStore, loadCountryFromIp } from "@web-astro/stores/UserData.store";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
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
import { onMounted, ref } from 'vue';
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form'
import GeolocationMap from '@/ui-plus/geolocation-selection-map/GeolocationMap.vue';
import { loadLeafletCDN } from '@/ui-plus/geolocation-selection-map/loadLeafletCDN';
import CountrySelect from '@/ui-plus/CountrySelect.vue';

defineProps<{
    buttonLabel?: string;
}>();

const emit = defineEmits<{
    (e: 'done', result: { lat: number, lng: number }): void
}>();

const schema = z.object({
    country: z.string().min(1, 'Required'),
    address1: z.string().min(1, 'Required'),
})

const form = useForm({
    validationSchema: toTypedSchema(schema),
})

onMounted(async () => {
    await loadCountryFromIp();
    setTimeout(() => {
        if (!form.values.country) {
            form.setFieldValue('country', userDataStore.value?.userData?.rememberLastCountry || '');
        }
    }, 100);
    setTimeout(() => {
        loadLeafletCDN(true);
    }, 1000);
})


const isDialogOpen = ref(false);
const { isLoading, globalError,
    // handleError,
    withSubmit } = useFormPlus(form, {
        persistenceFields: {
            country: 'REMEMBER_LAST_COUNTRY_INPUT_VALUE',
            address1: 'REMEMBER_LAST_ADDRESS1_INPUT_VALUE',
        },
    });

async function onSubmit(values: z.infer<typeof schema>) {
    await withSubmit(async () => {
        isDialogOpen.value = true;
        console.log('values', values);
    })
}

async function onMapConfirm(result: { lat: number, lng: number }) {
    isLoading.value = true;
    userDataStore.value!.userData!.rememberLastAddress = form.values.address1 || null;
    userDataStore.value!.userData!.rememberLastCountry = form.values.country || null;
    emit('done', result);
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
                    Confirm building entrance/door location
                </DialogTitle>
            </DialogHeader>
            <GeolocationMap :address="form.values.address1!"
                            :country="form.values.country!"
                            :lat="userDataStore.userData?.rememberLastLat!"
                            :lng="userDataStore.userData?.rememberLastLng!"
                            @done="onMapConfirm"
                            class="flex-1 overflow-hidden" />
        </DialogContent>
    </Dialog>

    <AutoForm :schema="schema"
              :field-config="{
                address1: {
                    // component: AutoFormFieldAddress,
                    // description: 'Enter your full address',
                    hideLabel: true,
                    inputProps: {
                        placeholder: 'Enter your full address',
                        autocomplete: 'street-address',
                    },
                },
            }"
              :form="form"
              @submit="onSubmit">

        <template #country>
            <div class="flex gap-2">
                <div>
                    <FormField v-slot="slotProps"
                               name="country">
                        <FormItem>
                            <FormControl>
                                <slot v-bind="slotProps">
                                    <CountrySelect v-bind="{ ...slotProps.componentField as any }"
                                                   class="h-10" />
                                </slot>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>
                <div class="flex-1">
                    <FormField v-slot="slotProps"
                               name="address1">
                        <FormItem>
                            <FormControl>
                                <slot v-bind="slotProps">
                                    <Input placeholder="Enter your address"
                                           v-bind="{ ...slotProps.componentField as any }"
                                           autocomplete="street-address" />
                                </slot>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>
            </div>
        </template>

        <template #address1>
            <div class="opacity-0"></div>
        </template>


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
                {{ buttonLabel || 'Order now' }}
                <ChevronRight />
            </Button>
        </div>
    </AutoForm>
</template>