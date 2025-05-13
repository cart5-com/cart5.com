<script lang="ts" setup>
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Item } from '@lib/zod/menuRootSchema'
import { menuRoot } from '../MenuRootStore'
import { Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { createNewItem, previewItem } from '../helpers'
import { toast } from '@/ui-plus/sonner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@lib/utils/formatCurrency'
import { taxSettings } from '@dashboard-spa-vue/pages/store/menu/TaxSettingsStore'
const searchQuery = ref('')

const filteredItems = computed(() => {
    const items = menuRoot.value.allItems || {}
    const query = searchQuery.value.toLowerCase()

    return Object.entries(items)
        // filter categories
        // .filter(([_id, item]) => item.t !== 'ct')
        // filter customizations
        // .filter(([_id, item]) => item.t !== 'c')
        .filter(([id, item]) => {
            const typedItem = item as Item
            return typedItem.lbl?.toLowerCase().includes(query) ||
                id.toLowerCase().includes(query)
        })
})

const getChildNames = (cIds: string[], joiner: string = ' | ') => {
    return cIds?.map(id => menuRoot.value?.allItems?.[id]?.lbl).filter(Boolean).join(joiner);
}

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

const getTypeName = (item: Item) => {
    return item.t === 'i' ? 'Item' :
        item.t === 'ct' ? 'Category' :
            item.t === 'c' ? 'Customization' :
                item.t === 'o' ? 'Option' :
                    'Unknown'
}


const onClickDeleteItem = (itemId: string) => {
    // Check if item exists
    if (!menuRoot.value?.allItems?.[itemId]) return

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${menuRoot.value.allItems[itemId]?.lbl}"?`)) return

    // Find items that have this item as a child
    const parentsWithThisChild = Object.entries(menuRoot.value.allItems || {})
        .filter(([_id, item]) => item.cIds?.includes(itemId))

    // If there are parents, show a warning and ask for confirmation
    if (parentsWithThisChild.length > 0) {
        const parentNames = parentsWithThisChild
            .map(([_id, item]) => item.lbl)
            .join(', ')

        if (!confirm(`This item is used in ${parentsWithThisChild.length} other places: ${parentNames}. Delete anyway?`)) return

        // Remove the item from all parent cIds arrays
        parentsWithThisChild.forEach(([_parentId, parent]) => {
            const index = parent.cIds?.indexOf(itemId) || -1
            if (index > -1 && parent.cIds) {
                parent.cIds.splice(index, 1)
            }
        })
    }

    // Remove from root children if it's there
    if (menuRoot.value.children) {
        const index = menuRoot.value.children.indexOf(itemId)
        if (index > -1) {
            menuRoot.value.children.splice(index, 1)
        }
    }

    // Delete the item from allItems
    delete menuRoot.value.allItems[itemId]

    toast.success('Item deleted successfully')
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
                    <TableHead>Type</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow v-for="[itemId, item] in filteredItems"
                          :key="itemId">
                    <TableCell>
                        {{ getTypeName(item) }}
                    </TableCell>
                    <TableCell class="capitalize line-clamp-1">
                        {{ item.lbl }}
                        <span class="text-xs text-muted-foreground "
                              v-if="item.cIds">
                            {{ getChildNames(item.cIds) }}
                        </span>
                    </TableCell>
                    <TableCell>{{ formatCurrency(item.prc ?? 0, taxSettings?.currency) }}</TableCell>
                    <TableCell class="space-x-2 flex items-center md:flex-row flex-col gap-2">
                        <Button variant="outline"
                                size="sm"
                                @click="onClickEditItem(item)">
                            <Pencil /> Edit
                        </Button>

                        <Button variant="destructive"
                                size="sm"
                                @click="onClickDeleteItem(itemId)">
                            <Trash2 /> Delete
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
