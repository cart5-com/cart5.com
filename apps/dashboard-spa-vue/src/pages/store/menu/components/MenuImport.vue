<script setup lang="ts">
import { exportMenuToCSV, getSampleMenuCSV, importMenuFromCSV } from '@lib/utils/menuImport';
import { menuRoot } from '../MenuRootStore';
import { toast } from "@/ui-plus/sonner";
import { Download, FileDown, FileUp, MoreHorizontal, Trash } from 'lucide-vue-next';
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

function downloadMenuAsCSV() {
    try {
        const csvContent = exportMenuToCSV(menuRoot.value);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `menu-${Date.now()}.csv`);
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Menu exported successfully');
    } catch (error) {
        console.error('Error exporting menu:', error);
        toast.error('Failed to export menu');
    }
}


function downloadSampleCSV() {
    try {
        const csvContent = getSampleMenuCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'sample-menu.csv');
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Sample menu downloaded successfully');
    } catch (error) {
        console.error('Error downloading sample:', error);
        toast.error('Failed to download sample menu');
    }
}

function deleteAllMenuItems() {
    if (!confirm('This will delete all menu/items. Continue?')) {
        return;
    }

    menuRoot.value = {
        allItems: {},
        children: [],
    };
}
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button variant="outline"
                    size="sm"
                    class="ml-5">
                <MoreHorizontal />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">

            <DropdownMenuItem @click="createAndClickFileInput">
                <FileUp /> Upload CSV file to import
            </DropdownMenuItem>

            <DropdownMenuItem @click="downloadMenuAsCSV">
                <FileDown /> Export your menu as CSV
            </DropdownMenuItem>

            <DropdownMenuItem @click="downloadSampleCSV">
                <Download /> Download sample CSV file
            </DropdownMenuItem>

            <DropdownMenuItem @click="deleteAllMenuItems"
                              class="bg-destructive text-destructive-foreground">
                <Trash /> Delete all menu/items
            </DropdownMenuItem>

            <div class="p-2 text-xs text-muted-foreground">
                to download your menu from other websites
                <br>
                You may use <a href="https://menu-2-csv.netlify.app/"
                   target="_blank"
                   class="underline">
                    menu-2-csv
                </a> tool
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
</template>