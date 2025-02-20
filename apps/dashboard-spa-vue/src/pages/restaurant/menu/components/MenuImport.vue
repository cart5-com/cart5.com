<script setup lang="ts">
import { ref } from 'vue';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { importMenuFromCSV, validateCSVHeaders } from 'lib/types/menuImport';
import { menuRoot } from '../store';
import { toast } from "@/ui-plus/sonner";

const fileInput = ref<HTMLInputElement | null>(null);

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
        const headers = content.split('\n')[0].split(',').map(h => h.trim());

        if (!validateCSVHeaders(headers)) {
            toast.error('Invalid CSV format. Please check the headers');
            return;
        }

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

        // Reset file input
        if (fileInput.value) {
            fileInput.value.value = '';
        }

    } catch (error) {
        console.error('Error importing menu:', error);
        toast.error('Failed to import menu');
    }
}
</script>

<template>
    <div class="flex items-center gap-4">
        <Input ref="fileInput"
               type="file"
               accept=".csv"
               @change="handleFileUpload" />
        <Button variant="outline"
                @click="() => fileInput?.click()">
            Import Menu
        </Button>
    </div>
</template>