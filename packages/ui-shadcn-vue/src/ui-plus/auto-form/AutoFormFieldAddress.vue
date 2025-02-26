<!-- <script setup lang="ts">
import type { FieldProps } from './interface'
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form'
import AutoFormLabel from './AutoFormLabel.vue'
import { beautifyObjectName } from './utils'
import Autocomplete from '@/ui-plus/auto-complete/Autocomplete.vue'
import { ref } from 'vue'
import { createEcomApiMapsClient, type predictionExtraType } from 'lib/hono/apiClients/ecomApiClient'

const ecomApiMapsClient = createEcomApiMapsClient();

const options = ref<string[]>([]);
const isInputLoading = ref(false);
let predictions: predictionExtraType[] = [];

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
async function onInputChange(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    isInputLoading.value = true;
    predictions = [];
    options.value = [];
    clearTimeout(debounceTimer);
    if (query.length < 3) {
        isInputLoading.value = false;
        return;
    }
    debounceTimer = setTimeout(async () => {
        const geocodeResult = await geocode(query);
        if (geocodeResult) {
            predictions = geocodeResult;
        }
        const { data, error } = await (await ecomApiMapsClient.api.maps.gmaps.autocomplete.$get({
            query: {
                input: query.trim().toLowerCase(),
            }
        })).json()
        if (error) {
            console.error("error", error);
        } else {
            predictions.push(...data.predictions);
            options.value = predictions.map(prediction => prediction.description) || [];
        }
        isInputLoading.value = false;
    }, 1000);
}

async function geocode(address: string) {
    const { data, error } = await (await ecomApiMapsClient.api.maps.gmaps.geocode.$get({
        query: {
            address: address.trim().toLowerCase(),
        }
    })).json();
    if (error) {
        console.error("error", error);
        return null;
    }
    if (data && data.results && data.results.length > 0) {
        return [
            {
                description: data.results[0].formatted_address,
                lat: data.results[0].geometry.location.lat,
                lng: data.results[0].geometry.location.lng
            }
        ] as predictionExtraType[];
    }
    return null;
}


defineOptions({
    inheritAttrs: false,
})

defineProps<FieldProps>()
</script>

<template>
    <FormField v-slot="slotProps"
               :name="fieldName">
        <FormItem>
            <AutoFormLabel v-if="!config?.hideLabel"
                           :required="required">
                {{ config?.label || beautifyObjectName(label ?? fieldName) }}
            </AutoFormLabel>
            <FormControl>
                <slot v-bind="slotProps">
                    <Autocomplete @inputChange="onInputChange"
                                  @optionClick="(optionIndex) => {
                                    slotProps.setValue(options[optionIndex]);
                                    console.log('onInputChange::slotProps.componentField.modelValue', slotProps.componentField.modelValue)
                                    console.log('onInputChange::predictions', predictions[optionIndex])
                                }"
                                  :options="options"
                                  :isInputLoading="isInputLoading"
                                  :autocomplete="options.length > 0 ? 'off' : 'on'"
                                  v-bind="{ ...slotProps.componentField, ...config?.inputProps }" />
                </slot>
            </FormControl>
            <FormDescription v-if="config?.description">
                {{ config.description }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template> -->
