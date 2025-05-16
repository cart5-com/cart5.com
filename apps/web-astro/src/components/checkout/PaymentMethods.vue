<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { Banknote, CreditCard, Calculator, OctagonX, Pencil, WalletCards } from 'lucide-vue-next';
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
import { listAvailablePaymentMethods } from '@lib/utils/listAvailablePaymentMethods';

const icons = [
    { name: 'CreditCard', component: CreditCard },
    { name: 'Banknote', component: Banknote },
    { name: 'Calculator', component: Calculator },
]

const availablePaymentMethods = computed(() => {
    return listAvailablePaymentMethods(window.storeData, currentOrderType.value);
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

defineExpose({
    selectedPaymentMethod
})
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
                            <component :is="icons.find(icon => icon.name === selectedPaymentMethod?.icon)?.component || WalletCards"
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
                        <DialogClose as-child>
                            <RadioGroupItem :id="method.id"
                                            :value="method.id"
                                            class="shadow-none data-[state=checked]:border-primary data-[state=checked]:bg-primary *:data-[slot=radio-group-indicator]:[&>svg]:fill-white *:data-[slot=radio-group-indicator]:[&>svg]:stroke-white" />
                            <div class="grid gap-1 font-normal">
                                <div class="font-medium flex items-center">
                                    <component :is="icons.find(icon => icon.name === method.icon)?.component || WalletCards"
                                               class="mr-2" />
                                    {{ method.name }}
                                </div>
                                <div class="text-muted-foreground text-sm leading-snug"
                                     v-if="method.description">
                                    {{ method.description }}
                                </div>
                            </div>
                        </DialogClose>
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
            No payment options found in store settings.
            <br>
            This could be a temporary issue.
            <br>
            Please try again later.
        </div>
    </div>
</template>