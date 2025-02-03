<script lang="ts" setup>
import type { MenuJSON } from "lib/types/menuTypes";
import ItemCard from "../components/ItemCard.vue";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-vue-next";

const props = defineProps<{
    menuJSON: MenuJSON,
}>()

const addNewItem = () => {
    const newItemId = `item-${Date.now()}`
    if (props.menuJSON) {
        // Initialize allItems if it doesn't exist
        if (!props.menuJSON.allItems) {
            props.menuJSON.allItems = {}
        }

        // Create new item
        props.menuJSON.allItems[newItemId] = {
            itemId: newItemId,
            itemLabel: `New Item ${Object.keys(props.menuJSON.allItems).length + 1}`,
            price: 0,
            description: '',
            itemSizes: []
        }
    }
}
</script>

<template>
    <div class="p-4">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">All Items</h2>
            <Button variant="outline"
                    @click="addNewItem">
                <Plus class="w-4 h-4 mr-2" /> Add New Item
            </Button>
        </div>

        <div v-if="menuJSON.allItems"
             class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ItemCard v-for="item in menuJSON.allItems"
                      :key="item.itemId"
                      :menuJSON="menuJSON"
                      :itemId="item.itemId!"
                      :hideMoveIcon="true" />
        </div>
    </div>
</template>