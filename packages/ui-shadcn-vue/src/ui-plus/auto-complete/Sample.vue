<script setup lang="ts">
import { ref } from 'vue';
import Autocomplete from './Autocomplete.vue'

const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'New Zealand', 'South Africa', 'India', 'China', 'Japan', 'Korea',
    // add 10 more countries
    'France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Greece', 'Turkey', 'Egypt', 'Nigeria', 'Kenya',
];
const options = ref<string[]>(countries);
const isInputLoading = ref(false);
const address = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
async function onInputChange(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    isInputLoading.value = true;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        options.value = countries.filter(country => country.toLowerCase().includes(query.toLowerCase()));
        isInputLoading.value = false;
    }, 2000);
}

function onOptionClick(index: number) {
    console.log('onOptionClick', index)
    address.value = options.value[index];
}
</script>

<template>
    <div>
        address: {{ address }}
    </div>

    <Autocomplete @inputChange="onInputChange"
                  @optionClick="onOptionClick"
                  :options="options"
                  :isInputLoading="isInputLoading"
                  v-model="address"
                  name="address" />
</template>