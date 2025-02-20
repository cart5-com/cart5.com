<script setup lang="ts">
import { importMenuFromCSV } from 'lib/types/menuImport';
import { menuRoot } from '../store';
import { toast } from "@/ui-plus/sonner";
import { CloudUpload, Download, Import } from 'lucide-vue-next';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button';

function createAndClickFileInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.style.display = 'none';
    input.onchange = handleFileUpload;
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

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
    } catch (error) {
        console.error('Error importing menu:', error);
        toast.error('Failed to import menu');
    }
}
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button variant="outline"
                    size="sm"
                    class="ml-5">
                Import/Export
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">

            <DropdownMenuItem @click="createAndClickFileInput">
                <CloudUpload /> Upload CSV file to import
            </DropdownMenuItem>

            <DropdownMenuItem>
                <Download /> Download CSV file to import
            </DropdownMenuItem>

            <DropdownMenuItem>
                <Download /> Download sample CSV file
            </DropdownMenuItem>

        </DropdownMenuContent>
    </DropdownMenu>
</template>