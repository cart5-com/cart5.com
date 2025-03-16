<script setup lang="ts">
import { Button } from '../components/ui/button'
import { Check, Copy } from 'lucide-vue-next'
import { ref } from 'vue'

const props = defineProps<{
    content: string
}>()

const copied = ref(false)

async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(props.content)
        copied.value = true
        setTimeout(() => {
            copied.value = false
        }, 2000)
    } catch (err) {
        console.error('Failed to copy text:', err)
    }
}
</script>

<template>
    <Button variant="outline"
            @click="copyToClipboard">
        <slot />
        <Check v-if="copied"
               class="h-4 w-4" />
        <Copy v-else
              class="h-4 w-4" />
    </Button>
</template>
