<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import CopyButton from '@/ui-plus/CopyButton.vue'

defineProps<{
  name: string
  totpKey: string
}>()

</script>

<template>
  <Accordion type="single"
             collapsible>
    <AccordionItem value="item-1">
      <AccordionTrigger>Or use a setup key</AccordionTrigger>
      <AccordionContent>
        <div class="flex items-center space-x-2">
          <span>Name</span>
          <CopyButton :content="name">
            {{ name }}
          </CopyButton>
        </div>

        <div class="flex items-center space-x-2">
          <span>Key</span>
          <CopyButton :content="totpKey">
            {{ totpKey }}
          </CopyButton>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>