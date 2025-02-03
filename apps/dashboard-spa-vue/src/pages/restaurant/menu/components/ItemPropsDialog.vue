<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ADDITIVES, ALLERGENS, Item, ITEM_LABELS } from 'lib/types/menuTypes';
import StringArraySelector from "@/ui-plus/string-array-selector/StringArraySelector.vue"
import { Dialog, DialogScrollContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

defineProps<{
    item?: Item
}>()

</script>

<template>
    <Dialog>
        <DialogTrigger>
            <Button variant="outline">
                <Settings /> Edit details (like ingredients, labels etc..)
            </Button>
        </DialogTrigger>
        <DialogScrollContent class="sm:max-w-[625px]"
                             v-if="item">
            <DialogHeader>
                <DialogTitle>Edit details for '{{ item.itemLabel }}'</DialogTitle>
            </DialogHeader>
            <Accordion type="single"
                       collapsible>
                <AccordionItem value="ingredients">
                    <AccordionTrigger>Ingredients (ex: Tomato, Onion etc..)</AccordionTrigger>
                    <AccordionContent>
                        <StringArraySelector v-model="item.ingredients"
                                             :available-options="[]"
                                             placeholder="Add new ingredient" />
                        <p class="text-sm text-muted-foreground mt-4">
                            all ingredients will become a removeable option,
                            for example you added "Tomato" and "Onion" to the ingredients,
                            customer will be able to remove "Onion" from the item
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="labels">
                    <AccordionTrigger>Item Labels (ex: Hot, Vegan etc..)</AccordionTrigger>
                    <AccordionContent>
                        <StringArraySelector v-model="item.itemLabels"
                                             :available-options="ITEM_LABELS"
                                             placeholder="Add new label" />

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