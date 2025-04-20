<script setup lang="ts">
import type { FieldProps } from './interface'
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form'
import AutoFormLabel from './AutoFormLabel.vue'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { beautifyObjectName } from './utils'
import { ref } from 'vue'
import { MapPin, House, Building, Hotel, Bed, Factory, BriefcaseBusiness, School, University, Landmark, Store, Castle, Hospital } from 'lucide-vue-next'

const open = ref(false);
defineProps<FieldProps>()

const icons = [
  { name: 'MapPin', component: MapPin },
  { name: 'House', component: House },
  { name: 'Building', component: Building },
  { name: 'Hotel', component: Hotel },
  { name: 'Bed', component: Bed },
  { name: 'Factory', component: Factory },
  { name: 'BriefcaseBusiness', component: BriefcaseBusiness },
  { name: 'School', component: School },
  { name: 'University', component: University },
  { name: 'Landmark', component: Landmark },
  { name: 'Store', component: Store },
  { name: 'Castle', component: Castle },
  { name: 'Hospital', component: Hospital }
]
</script>

<template>
  <FormField v-slot="slotProps"
             :name="fieldName">
    <FormItem v-bind="$attrs">
      <AutoFormLabel v-if="!config?.hideLabel"
                     :required="required">
        {{ config?.label || beautifyObjectName(label ?? fieldName) }}
      </AutoFormLabel>
      <FormControl>
        <Popover v-model:open="open">
          <PopoverTrigger class="flex">
            <Button type="button"
                    variant="outline"
                    size="lg"
                    class="h-12 w-12"
                    :disabled="config?.inputProps?.disabled">
              <component :is="icons.find(i => i.name === slotProps.componentField.modelValue)?.component || MapPin"
                         class="min-h-8 min-w-8" />
              <span v-if="slotProps.componentField.modelValue"
                    class="flex-1 text-sm text-left">
              </span>
              <span v-else
                    class="flex-1 text-sm text-left text-muted-foreground">
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-[300px] p-2"
                          align="start"
                          v-if="!config?.inputProps?.disabled">
            <div class="grid grid-cols-4 gap-2">
              <Button v-for="icon in icons"
                      :key="icon.name"
                      variant="outline"
                      class="h-12 w-12"
                      :class="{ 'ring-2 ring-primary': slotProps.componentField.modelValue === icon.name }"
                      @click="() => {
                        slotProps.setValue(icon.name);
                        open = false;
                      }">
                <component :is="icon.component"
                           class="min-h-8 min-w-8" />
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </FormControl>
      <FormDescription v-if="config?.description">
        {{ config.description }}
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>