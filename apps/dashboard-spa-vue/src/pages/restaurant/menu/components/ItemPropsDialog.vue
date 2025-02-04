<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ADDITIVES, ALLERGENS, Item, ITEM_LABELS } from 'lib/types/menuTypes';
import StringArraySelector from "@/ui-plus/string-array-selector/StringArraySelector.vue"
import { Dialog, DialogScrollContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import DateTimePropEditor from "@/ui-plus/date-time-prop-editor/DateTimePropEditor.vue"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

defineProps<{
    item?: Item
}>()

</script>

<template>
    <Dialog>
        <DialogTrigger>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger as-child>
                        <Button variant="outline">
                            <Settings /> More details
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"
                                    class="max-w-[200px] text-left">
                        Stock,
                        visibility,
                        ingredients,
                        labels,
                        allergens,
                        additives etc..
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </DialogTrigger>
        <DialogScrollContent class="sm:max-w-[625px]"
                             v-if="item">
            <DialogHeader>
                <DialogTitle>Edit details for '{{ item.itemLabel }}'</DialogTitle>
            </DialogHeader>


            <div class="grid grid-cols-4 items-center gap-4">
                <Label class="text-right">Internal Name</Label>
                <Input v-model="item.internalName"
                       class="col-span-3" />
            </div>


            <div class="grid grid-cols-4 items-start gap-4 border rounded-md p-4">
                <Label class="text-right">Out of Stock</Label>
                <div class="col-span-3">
                    <DateTimePropEditor v-model="item.isOutOfStock" />
                </div>
            </div>

            <div class="grid grid-cols-4 items-start gap-4 border rounded-md p-4">
                <Label class="text-right">Hide</Label>
                <div class="col-span-3">
                    <DateTimePropEditor v-model="item.isHidden" />
                </div>
            </div>

            <div class="grid grid-cols-4 items-center gap-4">
                <Label class="text-right">Hide Special Instructions input</Label>
                <Switch :checked="item.isSpecialInstructionsHidden"
                        @update:checked="(checked) => {
                            if (item) {
                                if (checked) {
                                    item.isSpecialInstructionsHidden = checked
                                } else {
                                    item.isSpecialInstructionsHidden = undefined
                                }
                            }
                        }" />
            </div>

            <Accordion type="multiple">
                <AccordionItem value="labels">
                    <AccordionTrigger>Item Labels (ex: Hot, Vegan etc..)</AccordionTrigger>
                    <AccordionContent>
                        <StringArraySelector v-model="item.itemLabels"
                                             :available-options="ITEM_LABELS"
                                             placeholder="Add new label" />

                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="ingredients">
                    <AccordionTrigger>Ingredients (ex: Tomato, Onion etc..)</AccordionTrigger>
                    <AccordionContent>
                        <StringArraySelector v-model="item.removeableIngredients"
                                             :available-options="[]"
                                             placeholder="Add new ingredient" />
                        <p class="text-sm text-muted-foreground mt-4">
                            all ingredients will become a removeable option,
                            for example you added "Tomato" and "Onion" to the ingredients,
                            customer will be able to remove "Onion" from the item
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="allergens">
                    <AccordionTrigger>Allergens (ex: Milk, nuts etc..)</AccordionTrigger>
                    <AccordionContent>
                        <StringArraySelector v-model="item.allergens"
                                             :available-options="ALLERGENS"
                                             placeholder="Add new allergen" />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="additives">
                    <AccordionTrigger>Additives (ex: Artificial colours, flavours etc..)</AccordionTrigger>
                    <AccordionContent>
                        <StringArraySelector v-model="item.additives"
                                             :available-options="ADDITIVES"
                                             placeholder="Add new additive" />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </DialogScrollContent>
    </Dialog>
</template>