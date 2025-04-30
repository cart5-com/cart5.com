<script setup lang="ts">
import { type DeliveryZone } from '@lib/zod/deliverySchema';
import EstimatedTimeEdit from '@/ui-plus/EstimatedTimeEdit.vue';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MapPin, Bird } from 'lucide-vue-next';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from '@/components/ui/badge'


defineProps<{
    zone: DeliveryZone
}>()
const emit = defineEmits(['openDialog', 'confirmDelete'])

</script>
<template>
    <Card :key="zone.id"
          class="shadow-sm max-w-xl mx-auto">
        <CardContent class="p-4">
            <div class="flex items-center justify-between">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <MapPin class="h-4 w-4" />
                        <h3 class="font-medium">
                            {{ zone.name }}
                        </h3>
                        <div class="flex flex-wrap gap-1 mt-1 sm:mt-0">
                            <Badge v-if="zone.isActive"
                                   variant="outline">
                                Active
                            </Badge>
                            <Badge v-else
                                   variant="destructive">
                                Inactive
                            </Badge>
                            <Badge v-if="zone.minCart"
                                   variant="outline">
                                minCart: {{ zone.minCart }}
                            </Badge>
                            <Badge v-if="zone.deliveryFee"
                                   variant="outline">
                                fee: {{ zone.deliveryFee }}
                            </Badge>
                            <Badge v-if="zone.deliveryFeePerKm"
                                   variant="outline">
                                fee/km: {{ zone.deliveryFeePerKm }}
                            </Badge>
                            <Badge v-if="zone.customEstimatedDeliveryTime"
                                   variant="outline">
                                {{ zone.customEstimatedDeliveryTime.min }} -
                                {{ zone.customEstimatedDeliveryTime.max }}
                                {{ zone.customEstimatedDeliveryTime.unit }}
                            </Badge>
                        </div>
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
                        <div class="space-y-4 px-1 max-w-lg mx-auto">
                            <div class="flex justify-between items-center">
                                <Label for="activeStatus">Active Status</Label>
                                <Switch id="activeStatus"
                                        :checked="zone.isActive"
                                        @update:checked="zone.isActive = $event" />
                            </div>
                            <div class="grid gap-4">
                                <div class="grid gap-2">
                                    <Label for="name">Zone Name</Label>
                                    <Input id="name"
                                           v-model="zone.name"
                                           placeholder="Enter zone name" />
                                </div>

                                <div class="grid gap-2 my-8 border-t pt-4">
                                    <Label for="minCart">Minimum Subtotal Value</Label>
                                    <Input id="minCart"
                                           type="number"
                                           v-model="zone.minCart"
                                           placeholder="0.00" />
                                    <p class="text-xs">
                                        Only items in the cart that exceed this value will be eligible for delivery.
                                        Tax, delivery fees, service fees, and other charges are not included in this
                                        calculation.
                                    </p>
                                </div>

                                <div class="border border-foreground rounded-md p-2">
                                    <p class="text-xs">
                                        You can set a tax rate for the Delivery Fee in the "Sidemenu" -> "Tax
                                        Settings" -> "Tax Rate for Delivery fees(%)"
                                    </p>
                                    <p class="text-xs my-2">
                                        Calculation: Base Fee + (Distance in km × Fee per km) + Tax
                                    </p>
                                    <div class="grid gap-2 pt-4">
                                        <Label for="deliveryFee">Delivery Base Fee</Label>
                                        <Input id="deliveryFee"
                                               type="number"
                                               v-model="zone.deliveryFee"
                                               placeholder="0.00" />
                                    </div>

                                    <div class="grid gap-2 my-4 border-t pt-4">
                                        <Label for="deliveryFeePerKm">Delivery Fee per KM
                                            <Bird class="inline-block" />
                                        </Label>
                                        <p class="text-xs">
                                            This is the delivery fee per kilometer as the crow flies.
                                        </p>
                                        <Input id="deliveryFeePerKm"
                                               type="number"
                                               v-model="zone.deliveryFeePerKm"
                                               placeholder="0.00" />
                                    </div>
                                </div>
                                <div class="grid gap-2 pt-4">
                                    <div class="flex items-center space-x-2">
                                        <Switch id="customEstimatedDeliveryTime"
                                                :checked="zone.customEstimatedDeliveryTime !== undefined"
                                                @update:checked="(checked: boolean) => {
                                                    if (checked) {
                                                        zone.customEstimatedDeliveryTime = {
                                                            min: 30,
                                                            max: 50,
                                                            unit: 'minutes'
                                                        }
                                                    } else {
                                                        zone.customEstimatedDeliveryTime = undefined
                                                    }
                                                }">
                                        </Switch>
                                        <Label for="customEstimatedDeliveryTime"> Custom Estimated Delivery
                                            Time for this zone</Label>
                                    </div>
                                    <EstimatedTimeEdit v-if="zone.customEstimatedDeliveryTime"
                                                       :estimatedTime="zone.customEstimatedDeliveryTime" />
                                </div>

                            </div>

                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
    </Card>
</template>