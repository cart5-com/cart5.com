<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { ref, onBeforeMount, computed } from 'vue';
import { Banknote, CreditCard, Calculator } from 'lucide-vue-next';
import type { PhysicalPaymentMethods, CustomPaymentMethod } from '@lib/zod/paymentMethodsSchema'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    RadioGroup,
    RadioGroupItem,
} from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { orderCurrentType } from '@web-astro/stores/UserData.store';

const props = defineProps<{
    modelValue: string
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: string): void
}>()

const selectedPaymentMethod = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: '',
    deep: false,
})

// Check if Stripe is enabled
const isStripeEnabled = window.storeData?.stripeSettings?.isStripeEnabled || false;

// Payment methods handling
// const availablePaymentMethods = ref<{
//     id: string;
//     name: string;
//     description?: string;
//     icon?: any;
// }[]>([]);

// Get the appropriate payment methods based on order type
const availablePaymentMethods = computed(() => {
    // console.log("getPaymentMethods window.storeData?.stripeSettings", window.storeData?.stripeSettings);
    // const isStripeEnabled = window.storeData?.stripeSettings?.isStripeEnabled;
    // const stripeRatePerOrder = window.storeData?.stripeSettings?.stripeRatePerOrder;
    // const stripeFeePerOrder = window.storeData?.stripeSettings?.stripeFeePerOrder;
    // const whoPaysStripeFee = window.storeData?.stripeSettings?.whoPaysStripeFee;

    let paymentMethods: PhysicalPaymentMethods | null = null;

    if (!window.storeData?.paymentMethods) {
        return [];
    }

    if (orderCurrentType.value === 'delivery') {
        paymentMethods = window.storeData.paymentMethods.deliveryPaymentMethods?.isActive ?
            window.storeData.paymentMethods.deliveryPaymentMethods || null :
            window.storeData.paymentMethods.defaultPaymentMethods || null;
    } else if (orderCurrentType.value === 'pickup') {
        paymentMethods = window.storeData.paymentMethods.pickupPaymentMethods?.isActive ?
            window.storeData.paymentMethods.pickupPaymentMethods || null :
            window.storeData.paymentMethods.defaultPaymentMethods || null;
    } else {
        paymentMethods = window.storeData.paymentMethods.defaultPaymentMethods || null;
    }

    const methods = [];

    // Add Stripe if enabled
    if (isStripeEnabled) {
        methods.push({
            id: 'stripe',
            name: 'Pay online',
            description: 'Pay with credit/debit card online using Stripe',
            icon: CreditCard
        });
    }

    if (paymentMethods?.cash) {
        methods.push({
            id: 'cash',
            name: 'Cash',
            description: orderCurrentType.value === 'delivery' ? 'Pay with cash on delivery' : 'Pay with cash at pickup',
            icon: Banknote
        });
    }

    if (paymentMethods?.cardTerminal) {
        methods.push({
            id: 'cardTerminal',
            name: 'Card',
            description: orderCurrentType.value === 'delivery' ? 'Pay with card on delivery' : 'Pay with card at pickup',
            icon: Calculator
        });
    }

    if (paymentMethods?.customMethods) {
        paymentMethods.customMethods.forEach((method: CustomPaymentMethod) => {
            if (method.isActive && method.name) {
                methods.push({
                    id: method.id || crypto.randomUUID(),
                    name: method.name,
                    description: method.description,
                });
            }
        });
    }

    return methods;
});

onBeforeMount(() => {
    if (availablePaymentMethods.value.length > 0) {
        // choose the first payment method by default // TODO: should we save this in user data?
        selectedPaymentMethod.value = availablePaymentMethods.value[0]?.id || '';
    }

});

</script>

<template>
    <!-- Payment Methods Selection -->
    <Card class="my-4"
          v-if="availablePaymentMethods.length > 0">
        <!-- selectedPaymentMethod:{{ selectedPaymentMethod }} -->
        <CardHeader>
            <CardTitle>Select a Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
            <!-- @update:model-value="" -->
            <RadioGroup v-model="selectedPaymentMethod"
                        class="max-w-sm">
                <Label v-for="method in availablePaymentMethods"
                       :key="method.id"
                       class="cursor-pointer hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-4 mb-2 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10 dark:has-[[data-state=checked]]:border-primary-foreground dark:has-[[data-state=checked]]:bg-primary/20">
                    <RadioGroupItem :id="method.id"
                                    :value="method.id"
                                    class="shadow-none data-[state=checked]:border-primary data-[state=checked]:bg-primary *:data-[slot=radio-group-indicator]:[&>svg]:fill-white *:data-[slot=radio-group-indicator]:[&>svg]:stroke-white" />
                    <div class="grid gap-1 font-normal">
                        <div class="font-medium flex items-center">
                            <component :is="method.icon"
                                       v-if="method.icon"
                                       class="mr-2" />
                            {{ method.name }}
                        </div>
                        <div class="text-muted-foreground text-sm leading-snug"
                             v-if="method.description">
                            {{ method.description }}
                        </div>
                    </div>
                </Label>
            </RadioGroup>
        </CardContent>
    </Card>
</template>