<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { Banknote, CreditCard, Calculator, OctagonX, Pencil } from 'lucide-vue-next';
import type { PhysicalPaymentMethods, CustomPaymentMethod } from '@lib/zod/paymentMethodsSchema'
import {
    RadioGroup,
    RadioGroupItem,
} from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { currentOrderType, userDataStore, waitUntilUserDataReady } from '@web-astro/stores/UserData.store';
import {
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogScrollContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button';

const isStripeEnabled = window.storeData?.stripeSettings?.isStripeEnabled || false;


const availablePaymentMethods = computed(() => {

    let paymentMethods: PhysicalPaymentMethods | null = null;

    if (!window.storeData?.paymentMethods) {
        return [];
    }

    if (currentOrderType.value === 'delivery') {
        paymentMethods = window.storeData.paymentMethods.deliveryPaymentMethods?.isActive ?
            window.storeData.paymentMethods.deliveryPaymentMethods || null :
            window.storeData.paymentMethods.defaultPaymentMethods || null;
    } else if (currentOrderType.value === 'pickup') {
        paymentMethods = window.storeData.paymentMethods.pickupPaymentMethods?.isActive ?
            window.storeData.paymentMethods.pickupPaymentMethods || null :
            window.storeData.paymentMethods.defaultPaymentMethods || null;
    } else {
        paymentMethods = window.storeData.paymentMethods.defaultPaymentMethods || null;
    }

    const methods = [];

    if (isStripeEnabled) {
        methods.push({
            id: 'stripe',
            name: 'Pay online',
            description: 'Stripe checkout (Credit/Debit Card, Apple Pay, Google Pay, etc.)',
            icon: CreditCard
        });
    }

    if (paymentMethods?.cash) {
        methods.push({
            id: 'cash',
            name: 'Cash',
            description: currentOrderType.value === 'delivery' ? 'Pay with cash on delivery' : 'Pay with cash at pickup',
            icon: Banknote
        });
    }

    if (paymentMethods?.cardTerminal) {
        methods.push({
            id: 'cardTerminal',
            name: 'Card',
            description: currentOrderType.value === 'delivery' ? 'Pay with card on delivery' : 'Pay with card at pickup',
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

onMounted(async () => {
    await waitUntilUserDataReady();
    autoSelectPaymentMethod();
});

const autoSelectPaymentMethod = () => {
    if (availablePaymentMethods.value.length > 0) {
        if (!availablePaymentMethods.value.find(method => method.id === userDataStore.value.userData?.rememberLastPaymentMethodId)) {
            userDataStore.value.userData!.rememberLastPaymentMethodId = availablePaymentMethods.value[0]?.id || '';
        }
    }
}

const selectedPaymentMethod = computed(() => {
    const method = availablePaymentMethods.value.find(method => method.id === userDataStore.value.userData?.rememberLastPaymentMethodId);
    if (method) {
        return method;
    }
    autoSelectPaymentMethod();
    return availablePaymentMethods.value[0];
});

</script>

<template>
    <div class="my-4">
        <Dialog v-if="availablePaymentMethods.length > 0">
            <DialogTrigger as-child
                           class="w-full p-4 hover:bg-card/80 cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-between">
                <div>
                    <div>
                        <h3 class="font-bold text-xl mb-2">Payment</h3>
                        <div class="font-medium flex items-center">
                            <component :is="selectedPaymentMethod?.icon"
                                       v-if="selectedPaymentMethod?.icon"
                                       class="mr-2 flex-shrink-0" />
                            {{ selectedPaymentMethod?.name }}
                        </div>
                        <div class="text-muted-foreground text-sm leading-snug"
                             v-if="selectedPaymentMethod?.description">
                            {{ selectedPaymentMethod?.description }}
                        </div>
                    </div>
                    <Pencil class="ml-2" />
                </div>
            </DialogTrigger>
            <DialogScrollContent>
                <DialogHeader>
                    <DialogTitle>Select a payment method</DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                <RadioGroup v-model="userDataStore.userData!.rememberLastPaymentMethodId!">
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

                <DialogFooter>
                    <DialogClose as-child>
                        <Button variant="secondary"
                                class="w-full">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogScrollContent>
        </Dialog>
        <div v-else
             class="p-2 bg-destructive text-destructive-foreground rounded-lg">
            <OctagonX class="mr-1 inline-block" />
            No payment methods available
        </div>
    </div>
</template>