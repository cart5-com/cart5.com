<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircleIcon } from 'lucide-vue-next';
import { useVModel } from '@vueuse/core'
import { ref } from 'vue'

const props = defineProps<{
    modelValue?: string[]
    availableOptions?: string[]
    placeholder?: string
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', payload: string[]): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: undefined,
    deep: props.modelValue ? false : true,
})

const customValue = ref('');

const addCustomValue = () => {
    if (!modelValue.value) {
        modelValue.value = [];
    }
    const value = customValue.value.trim().toLowerCase();
    if (modelValue.value?.includes(value)) {
        toggleValue(value);
    } else if (value && !modelValue.value?.includes(value)) {
        modelValue.value?.push(value);
        customValue.value = ''; // Clear the input
    }
};

const toggleValue = (value: string) => {
    if (!modelValue.value) {
        modelValue.value = [];
    }
    const index = modelValue.value?.indexOf(value);
    if (index === -1) {
        modelValue.value?.push(value);
    } else {
        modelValue.value?.splice(index ?? 0, 1);
    }
    if (modelValue.value?.length === 0) {
        modelValue.value = undefined;
    }
};
</script>

<template>
    <div class="space-y-4">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card v-for="option in [...(availableOptions ?? []), ...(modelValue ?? []).filter(c => !(availableOptions ?? []).includes(c))]"
                  :key="option"
                  :title="option"
                  :class="[
                    'cursor-pointer transition-colors p-4 text-center hover:bg-muted/50 capitalize line-clamp-1 overflow-hidden truncate',
                    (modelValue ?? []).includes(option) ? 'bg-primary/10 border-primary' : ''
                ]"
                  @click="toggleValue(option)">
                {{ option }}
            </Card>
        </div>

        <div class="flex gap-2">
            <Input v-model="customValue"
                   :placeholder="placeholder ?? 'Add custom value'"
                   @keyup.enter="addCustomValue"
                   class="max-w-xs" />
            <Button variant="outline"
                    size="icon"
                    @click="addCustomValue">
                <PlusCircleIcon class="h-4 w-4" />
            </Button>
        </div>
    </div>
</template>