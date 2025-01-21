<script setup lang="ts">
import { type DeliveryZone } from 'lib/types/restaurantTypes';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MapPin } from 'lucide-vue-next';

defineProps<{
    zone: DeliveryZone
}>()
const emit = defineEmits(['openDialog', 'confirmDelete'])

</script>
<template>
    <Card :key="zone.id"
          class="shadow-sm">
        <CardContent class="p-4">
            <div class="flex items-center justify-between">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <MapPin class="h-4 w-4" />
                        <h3 class="font-medium">{{ zone.name }}</h3>
                    </div>
                    <p class="text-sm text-muted-foreground capitalize">
                        {{ zone.shapeType }} Zone
                    </p>
                </div>
                <div class="space-x-2">
                    <Button variant="outline"
                            size="sm"
                            @click="emit('openDialog', zone)">
                        Edit
                    </Button>
                    <Button variant="destructive"
                            size="sm"
                            @click="emit('confirmDelete', zone)">
                        Delete
                    </Button>
                </div>
            </div>

            <Accordion type="single"
                       collapsible
                       class="mt-4">
                <AccordionItem value="details">
                    <AccordionTrigger>Zone Details</AccordionTrigger>
                    <AccordionContent>
                        <pre class="text-sm bg-muted p-2 rounded-md overflow-x-auto">{{ JSON.stringify(zone, null, 2) }}
                        </pre>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
    </Card>
</template>