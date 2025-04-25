<script setup lang="ts">
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { XIcon, PlusIcon, Banknote, Calculator } from 'lucide-vue-next';
import type { PhysicalPaymentMethods, CustomPaymentMethod } from '@lib/zod/paymentMethodsSchema';
import { Textarea } from '@/components/ui/textarea';

const props = defineProps<{
    paymentMethods: PhysicalPaymentMethods;
}>();

const addCustomMethod = () => {
    if (!props.paymentMethods.customMethods) {
        props.paymentMethods.customMethods = [];
    }
    const newMethod: CustomPaymentMethod = {
        id: crypto.randomUUID(),
        name: '',
        description: '',
        isActive: false
    };
    props.paymentMethods.customMethods.push(newMethod);
};

const removeCustomMethod = (index: number) => {
    if (props.paymentMethods.customMethods) {
        props.paymentMethods.customMethods.splice(index, 1);
    }
};
</script>

<template>
    <div class="space-y-6">
        <div v-if="paymentMethods.isActive"
             class="space-y-4">
            <div class="flex items-center space-x-2">
                <Switch id="cash"
                        :checked="paymentMethods.cash"
                        @update:checked="(checked) => paymentMethods.cash = checked" />
                <label for="cash">
                    <Banknote class="inline-block mr-2" />
                    Cash (pickup counter, delivery person, in store)
                </label>
            </div>

            <div class="flex items-center space-x-2">
                <Switch id="cardTerminal"
                        :checked="paymentMethods.cardTerminal"
                        @update:checked="(checked) => paymentMethods.cardTerminal = checked" />
                <label for="cardTerminal">
                    <Calculator class=" inline-block mr-2" />
                    Card (pickup counter, delivery person, in store)
                </label>
            </div>

            <div class="border-t pt-4">
                <h3 class="font-medium mb-4">Custom Payment Methods</h3>

                <div v-for="(method, index) in paymentMethods.customMethods"
                     :key="method.id"
                     class="space-y-2 mb-4">
                    <div class="flex gap-2">
                        <Input v-model="method.name"
                               placeholder="Name (e.g. Bank Transfer)" />
                        <Button variant="outline"
                                size="sm"
                                @click="removeCustomMethod(index)">
                            <XIcon class="h-4 w-4" />
                        </Button>
                    </div>
                    <Textarea v-model="method.description"
                              placeholder="Description (optional) Here is our bank transfer details. We can only start preparing your order once payment is received." />
                    <div class="flex items-center space-x-2">
                        <Switch :checked="method.isActive"
                                :disabled="!method.name || method.name === ''"
                                @update:checked="(checked) => method.isActive = checked" />
                        <label>Active</label>
                    </div>
                </div>

                <Button variant="outline"
                        size="sm"
                        @click="addCustomMethod">
                    <PlusIcon class="h-4 w-4 mr-2" />
                    Add Custom Method
                </Button>
            </div>
        </div>
    </div>
</template>