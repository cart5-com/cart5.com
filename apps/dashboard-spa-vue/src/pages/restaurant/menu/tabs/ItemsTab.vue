<script lang="ts" setup>
import ItemCard from "../components/ItemCard.vue";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-vue-next";
import { menuJSON } from "../store";

const addNewItem = () => {
    const newItemId = `item-${Date.now()}`
    if (menuJSON.value) {
        // Initialize allItems if it doesn't exist
        if (!menuJSON.value.allItems) {
            menuJSON.value.allItems = {}
        }

        // Create new item
        menuJSON.value.allItems[newItemId] = {
            itemId: newItemId,
            itemLabel: `New Item ${Object.keys(menuJSON.value.allItems).length + 1}`,
            price: 1,
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