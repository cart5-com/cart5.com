<script setup lang="ts">
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from '@/components/ui/dialog';
import { type ServiceFee } from '@lib/zod/serviceFee';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-vue-next';
import { ref } from 'vue';

const props = defineProps<{
    storeId: string;
    overrideFee?: ServiceFee | null;
}>();

const emit = defineEmits<{
    (e: 'upsertStore', storeId: string, fee?: ServiceFee | null): void;
}>();

const ratePerOrder = ref(props.overrideFee?.ratePerOrder ?? 0);
const feePerOrder = ref(props.overrideFee?.feePerOrder ?? 0);
</script>

<template>
    <Dialog>
        <DialogTrigger as-child>
            <Button size="icon"
                    variant="outline">
                <Settings class="h-4 w-4" />
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Custom service fee</DialogTitle>
                <DialogDescription>
                    Use a custom service fee for this store.
                    <br>
                    <br>
                    <span class="text-muted-foreground">
                        Note: If you leave the fee fields empty or zero,
                        <br>
                        it will still override the default values
                    </span>
                </DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="ratePerOrder"
                           class="text-right">
                        Rate per Order
                    </Label>
                    <Input id="ratePerOrder"
                           type="number"
                           min="0"
                           step="0.01"
                           class="col-span-3"
                           v-model="ratePerOrder" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="username"
                           class="text-right">
                        Fixed Fee per Order
                    </Label>
                    <Input id="feePerOrder"
                           type="number"
                           min="0"
                           step="0.01"
                           class="col-span-3"
                           v-model="feePerOrder" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose as-child>
                    <Button type="submit"
                            variant="outline"
                            @click="emit('upsertStore', storeId, undefined)">
                        Remove custom and use default values
                    </Button>
                </DialogClose>
                <DialogClose as-child>
                    <Button type="submit"
                            @click="emit('upsertStore', storeId, {
                                ratePerOrder: Number(ratePerOrder),
                                feePerOrder: Number(feePerOrder)
                            })">
                        Save
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>