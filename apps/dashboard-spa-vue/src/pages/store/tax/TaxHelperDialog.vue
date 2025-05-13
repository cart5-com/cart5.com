<script setup lang="ts">
import { ref, computed, defineEmits } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-vue-next';
import { salesTaxRates, allCountriesAndStatesWithMultipleSalesTaxJurisdiction } from '@lib/utils/sales_tax_rates';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import CountrySelect from '@/ui-plus/CountrySelect.vue';

const isOpen = ref(false);
const selectedCountry = ref('');
const selectedState = ref('');

const emit = defineEmits(['tax-location-selected']);

const states = computed(() => {
    if (!selectedCountry.value || !salesTaxRates[selectedCountry.value]?.states) {
        return [];
    }
    return Object.keys(allCountriesAndStatesWithMultipleSalesTaxJurisdiction[selectedCountry.value] || {}).sort();
});

const hasStates = computed(() => {
    return states.value.length > 0;
});

const applyTaxSettings = () => {
    emit('tax-location-selected', selectedCountry.value, selectedState.value);
    isOpen.value = false;
    // Reset selections
    selectedState.value = '';
};
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogTrigger as-child>
            <Button variant="ghost"
                    size="icon"
                    class="rounded-full">
                <HelpCircle class="h-5 w-5" />
                <span class="sr-only">Tax Helper</span>
            </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Tax Settings Helper</DialogTitle>
            </DialogHeader>

            <div class="space-y-4 mt-4">
                <p class="text-sm text-muted-foreground">
                    Select a country and state/region to automatically fill tax rate settings based on common tax rates
                    for that location.
                </p>

                <div class="space-y-2">
                    <Label for="country">Country</Label>
                    <CountrySelect v-model="selectedCountry"
                                   showCountryName />
                </div>

                <div class="space-y-2"
                     v-if="hasStates">
                    <Label for="state">State/Region</Label>
                    <Select v-model="selectedState">
                        <SelectTrigger>
                            <SelectValue placeholder="Select a state or region" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="code in states"
                                        :key="code"
                                        :value="code">
                                {{ allCountriesAndStatesWithMultipleSalesTaxJurisdiction[selectedCountry][code] }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div class="text-sm text-muted-foreground"
                     v-if="selectedCountry">
                    <div v-if="selectedCountry && !selectedState && hasStates">
                        Please select a state/region to continue.
                    </div>
                    <div v-else-if="selectedCountry && salesTaxRates[selectedCountry]">
                        <p class="font-medium">Tax Info:</p>
                        <p>Type:
                            {{ (salesTaxRates[selectedCountry]?.type || '').toUpperCase() }}
                            <span v-if="salesTaxRates[selectedCountry]?.states?.[selectedState]?.type">
                                {{ salesTaxRates[selectedCountry]?.states?.[selectedState]?.type.toUpperCase() }}
                            </span>
                        </p>
                        <p>Currency: {{ salesTaxRates[selectedCountry]?.currency || '' }}</p>
                        <p>Base Rate: {{ Math.round((salesTaxRates[selectedCountry]?.rate || 0) * 100) }}%</p>
                        <p
                           v-if="selectedState && selectedCountry && salesTaxRates[selectedCountry]?.states && Object.prototype.hasOwnProperty.call(salesTaxRates[selectedCountry].states, selectedState)">
                            + State Rate:
                            {{ Math.round((salesTaxRates[selectedCountry]?.states?.[selectedState]?.rate || 0) * 100) }}%
                        </p>
                    </div>
                </div>
            </div>

            <DialogFooter class="mt-6">
                <Button @click="applyTaxSettings"
                        :disabled="!selectedCountry || (hasStates && !selectedState)">
                    Apply Settings
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>