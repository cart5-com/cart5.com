<script lang="ts" setup>
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Item } from '@lib/types/menuType'
import { menuRoot } from '../store'
import { Eye, Pencil, Plus } from 'lucide-vue-next'
import { createNewItem, previewItem } from '../helpers'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

const searchQuery = ref('')

const filteredItems = computed(() => {
    const items = menuRoot.value.allItems || {}
    const query = searchQuery.value.toLowerCase()

    return Object.entries(items)
        // filter categories
        .filter(([_id, item]) => item.t !== 'ct')
        // filter customizations
        .filter(([_id, item]) => item.t !== 'c')
        .filter(([id, item]) => {
            const typedItem = item as Item
            return typedItem.lbl?.toLowerCase().includes(query) ||
                id.toLowerCase().includes(query)
        })
})

const onClickAddNewItem = () => {
    const existingOnes = Object.values(menuRoot.value.allItems ?? {}).filter(item => item.t === 'i');
    const lbl = `New item ${existingOnes.length + 1}`;
    const parentItemId = undefined;
    const newItemId = createNewItem('i', { lbl }, parentItemId);
    setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
    }, 500)
    setTimeout(() => {
        previewItem(newItemId)
    }, 500)
}

const onClickEditItem = (item: Item) => {
    if (!item.id) {
        return
    }
    previewItem(item.id)
}
</script>

<template>
    <div class="space-y-4">
        <div class="flex justify-between items-center">
            <Input v-model="searchQuery"
                   placeholder="Search items..."
                   class="max-w-sm" />

            <Button variant="outline"
                    @click="onClickAddNewItem">
                <Plus /> Add New Item
            </Button>
        </div>

        <!-- table view -->
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow v-for="[itemId, item] in filteredItems"
                          :key="itemId">
                    <TableCell class="capitalize line-clamp-1">{{ item.lbl }}</TableCell>
                    <TableCell>{{ item.prc?.toFixed(2) }}</TableCell>
                    <TableCell class="space-x-2">
                        <Button variant="outline"
                                size="sm"
                                @click="onClickEditItem(item)">
                            <Pencil /> Edit
                        </Button>
                        <Button variant="outline"
                                size="sm"
                                @click="previewItem(itemId)">
                            <Eye /> Preview
                        </Button>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>

        <!-- grid view -->
        <!-- <TableIcon />
        <Grid2X2 />
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2  p-2 my-4">
            <div v-for="([itemId]) in filteredItems"
                 :key="itemId">
                <ItemCard :itemId="itemId"
                          :hide-move-icon="true" />
            </div>
        </div> -->
    </div>
</template>
