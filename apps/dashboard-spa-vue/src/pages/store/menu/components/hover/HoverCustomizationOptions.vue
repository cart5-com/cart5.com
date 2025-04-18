<script lang="ts" setup>
import { type ItemId } from "@lib/zod/menuRootSchema";
import { menuRoot } from "../../MenuRootStore";
import { computed } from 'vue';
import {
    Plus,
    Circle,
} from 'lucide-vue-next';

const props = defineProps<{
    itemId?: ItemId
}>()

const currentItem = computed(() => {
    if (props.itemId) {
        return menuRoot.value.allItems?.[props.itemId]
    }
    return undefined
})

const isRadioMode = computed(() => {
    return currentItem.value?.maxQ === 1 && currentItem.value?.minQ === 1
})


</script>

<template>
    <div>
        <div v-if="currentItem?.cIds"
             class="text-sm">
            <div v-for="(optionItemId) in currentItem.cIds"
                 :key="optionItemId">

                <div class="border border-card-foreground rounded-md my-2 overflow-hidden">
                    <div class="items-center p-1 bg-card grid grid-cols-8 gap-1"
                         :class="[
                            // (isMaxQuantity() && !isRadioMode) ? 'opacity-40 text-xs   ' : '',
                        ]">
                        <span class="capitalize col-span-5">
                            {{ menuRoot.allItems?.[optionItemId]?.lbl || 'Name:' }}
                        </span>
                        <!-- <span class="capitalize text-right">
                            {{ menuRoot.allItems![optionItemId!].opPrc || '+price' }}
                        </span> -->

                        <template v-if="isRadioMode">
                            <Circle class=" justify-self-end" />
                        </template>
                        <template v-else>
                            <Plus class="border border-foreground rounded-md justify-self-end" />
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
