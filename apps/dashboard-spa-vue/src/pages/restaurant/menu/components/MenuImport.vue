<script setup lang="ts">
import { ref } from 'vue';
import { Input } from "@/components/ui/input";
import { importMenuFromCSV } from 'lib/types/menuImport';
import { menuRoot } from '../store';
import { toast } from "@/ui-plus/sonner";

const fileInputModel = ref<File>();

async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
        toast.error('No file selected');
        return;
    }

    if (file.type !== 'text/csv') {
        toast.error('Please upload a CSV file');
        return;
    }

    try {
        const content = await file.text();
        const newMenuRoot = importMenuFromCSV(content);

        // Confirm before overwriting existing menu
        if (Object.keys(menuRoot.value.allItems || {}).length > 0) {
            if (!confirm('This will overwrite your existing menu. Continue?')) {
                return;
            }
        }

        // Update menu
        menuRoot.value = newMenuRoot;
        toast.success('Menu imported successfully');

        setTimeout(() => {
            fileInputModel.value = undefined;
        }, 100);

    } catch (error) {
        console.error('Error importing menu:', error);
        toast.error('Failed to import menu');
    }
}
</script>

<template>
    <div class="flex items-center gap-4">
        <Input type="file"
               accept=".csv"
               v-model="fileInputModel"
               @change="handleFileUpload" />
    </div>
</template>