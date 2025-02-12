<script setup lang="ts">
import { menuRoot } from "../store";
import { calculateBucketItemPrice, type BucketItem, type ItemId } from "lib/types/menuType";
import { computed, onMounted, ref, watch } from "vue";
import ItemPreviewRecursiveChildrenEditable from "./ItemPreviewRecursiveChildrenEditable.vue";
import { Button } from "@/components/ui/button";
import { toast } from "@/ui-plus/sonner";
import draggable from "vuedraggable";
import {
    NumberField,
    NumberFieldContent,
    NumberFieldDecrement,
    NumberFieldIncrement,
    NumberFieldInput,
} from '@/components/ui/number-field'
import { ChevronUpSquare, DollarSign, ListTodo, Plus } from "lucide-vue-next";
import InputInline from "@/ui-plus/inline-edit/InputInline.vue";
import TextareaInline from "@/ui-plus/inline-edit/TextareaInline.vue";
import { addChildItem, createNewItem } from "../helpers";
import SelectWithSearch from "@/ui-plus/SelectWithSearch/SelectWithSearch.vue";

const props = defineProps<{
    itemId?: ItemId
}>()

const currentItem = computed(() => {
    if (props.itemId) {
        return menuRoot.value.allItems?.[props.itemId]
    }
    return undefined
})

const bucketItem = ref<BucketItem>({
    itemId: props.itemId,
    quantity: 1,
    childrenState: [],
})

const isCollapsed = ref(false);

onMounted(() => {
    setTimeout(() => {
        if (currentItem.value?.children) {
            isCollapsed.value = currentItem.value?.children?.length === 0
        } else {
            isCollapsed.value = true;
        }
    })
})

const unlink = (index: number) => {
    if (currentItem.value?.children) {
        currentItem.value.children.splice(index, 1)
        if (currentItem.value.children.length === 0) {
            currentItem.value.children = undefined
        }
    }
}

const onClickAddNewCustomization = (search: string | undefined) => {
    const childLen = (currentItem?.value?.children || [])?.length;
    const itemLabel = search ? search.trim() : `Customize ${currentItem?.value?.itemLabel} ` +
        `${childLen === 0 ? '' : `(${childLen + 1})`}`;
    const parentItemId = currentItem?.value?.itemId;
    // const newItemId =
    createNewItem('customization', { itemLabel, maxQuantity: 1, minQuantity: 1 }, parentItemId);
    // setTimeout(() => {
    // editCustomization(newItemId)
    // }, 500)
}

const randomNumber = crypto.randomUUID()

const bucketTotalPrice = ref("");

watch([bucketItem, currentItem], () => {
    bucketTotalPrice.value = calculateBucketItemPrice(bucketItem.value, menuRoot.value)
}, { deep: true })

onMounted(() => {
    bucketTotalPrice.value = calculateBucketItemPrice(bucketItem.value, menuRoot.value)
})

const checkBucketItem = () => {
    // count .min-quantity-warning classes inside .warning-container-${randomNumber}
    const warningContainer = document.querySelector(`.warning-container-${randomNumber}`)
    const warningCount = warningContainer?.querySelectorAll('.min-quantity-warning').length
    if (warningCount && warningCount > 0) {
        // focus on the first warning
        const firstWarning = warningContainer?.querySelector<HTMLElement>('.min-quantity-warning')
        if (firstWarning) {
            firstWarning.scrollIntoView({ behavior: 'smooth', block: 'center' })
            firstWarning.focus()
            setTimeout(() => {
                firstWarning.parentElement?.classList.add('headShake-animation')
                setTimeout(() => {
                    firstWarning.parentElement?.classList.remove('headShake-animation')
                }, 500)
            }, 300)
        }
        return false
    } else {
        return true;
    }
}

</script>

<template>
    <div class="w-full"
         v-if="currentItem">
        <div class="p-1 sm:p-4">
            <div class="space-y-4">

                <InputInline v-model="currentItem.itemLabel"
                             placeholder="Name:">
                    <template #trigger>
                        <span class="capitalize cursor-text text-2xl font-bold">
                            {{ currentItem.itemLabel || 'Name:' }}
                        </span>
                    </template>
                </InputInline>

                <TextareaInline v-model="currentItem.description"
                                placeholder="Description">
                    <template #trigger>
                        <span class="capitalize cursor-text line-clamp-3">
                            {{ currentItem.description || 'Description:' }}
                        </span>
                    </template>
                </TextareaInline>


                <InputInline type="number"
                             placeholder="Price: $"
                             v-model="currentItem.price">
                    <template #trigger>
                        <div class="cursor-text flex">
                            <DollarSign /> {{ currentItem.price || 'Price:' }}
                        </div>
                    </template>
                </InputInline>

            </div>
            <div :class="`warning-container-${randomNumber}`"
                 class="mt-8">
                <div v-if="currentItem">
                    <Button variant="outline"
                            class="w-full"
                            v-if="isCollapsed"
                            @click="isCollapsed = false">
                        <ListTodo /> Customizations
                    </Button>
                    <div v-else
                         class="border rounded-lg p-1 sm:p-4">

                        <div class="flex justify-between items-center mb-4 gap-2">
                            <Button variant="ghost"
                                    @click="isCollapsed = true">
                                Customizations
                                <ChevronUpSquare />
                            </Button>
                            <SelectWithSearch :items="Object.values(menuRoot.allItems ?? {})
                                // .filter(item => item.type !== 'category' && item.type !== 'option' && item.itemId !== currentItem?.itemId)
                                .map(item => ({
                                    key: item.itemId,
                                    name: item.itemLabel
                                }))"
                                              @select="(item) => {
                                                addChildItem(currentItem?.itemId, item.key)
                                            }"
                                              @create-new="onClickAddNewCustomization"
                                              :has-new-button="true"
                                              heading="Link an existing item">
                                <template #trigger>
                                    <Button variant="outline">
                                        <Plus />
                                    </Button>
                                </template>
                            </SelectWithSearch>
                        </div>
                        <draggable v-model="currentItem.children"
                                   item-key="itemId"
                                   group="customization-items"
                                   handle=".customization-drag-handle"
                                   class="space-y-2">
                            <template #item="{ element: child, index }">
                                <ItemPreviewRecursiveChildrenEditable v-if="bucketItem.childrenState"
                                                                      :parent-item-id="currentItem?.itemId"
                                                                      :itemId="child"
                                                                      @unlink="() => {
                                                                        unlink(index)
                                                                    }"
                                                                      :is-draggable="true"
                                                                      v-model="bucketItem.childrenState[index]" />
                            </template>
                        </draggable>
                    </div>
                </div>

                <!-- {{ menu2Store.allItems?.[child]?.itemLabel }} -->
                <!-- <div v-for="(child, index) in currentItem?.children"
                     :key="child">
                    <ItemPreviewRecursiveChildrenEditable v-if="bucketItem.childrenState"
                                                          :itemId="child"
                                                          v-model="bucketItem.childrenState[index]" />
                </div> -->
            </div>
            <!-- <details>
                <summary>bucketItem</summary>
                <pre class="text-xs max-w-full overflow-y-auto">{{ bucketItem }}</pre>
            </details> -->
            <NumberField id="quantity"
                         class="max-w-40 mt-8"
                         v-model="bucketItem.quantity"
                         :default-value="1"
                         :step="1"
                         :min="1">
                <NumberFieldContent>
                    <NumberFieldDecrement class="hidden sm:block bg-secondary rounded-l-md hover:bg-secondary/60" />
                    <NumberFieldInput />
                    <NumberFieldIncrement class="hidden sm:block bg-secondary rounded-r-md hover:bg-secondary/60" />
                </NumberFieldContent>
            </NumberField>
            <Button class="w-full mt-8"
                    @click="() => {
                        if (checkBucketItem()) {
                            $emit('close', bucketItem)
                        } else {
                            toast.error('Please select required options')
                        }
                    }">
                Add {{ bucketItem.quantity }} to cart
                (Total: ${{ bucketTotalPrice }})
            </Button>
        </div>
        <div
             class="sticky bottom-0 rounded-md bg-background w-full flex flex-col justify-between gap-2 items-center text-xs">
            Total: ${{ bucketTotalPrice }}
        </div>

    </div>
</template>