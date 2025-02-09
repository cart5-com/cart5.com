<script lang="ts" setup>
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import MenuTab from './tabs/MenuTab.vue';



</script>

<template>
    <div>
        <Tabs default-value="menu"
              class="w-full">
            <TabsList class="mb-8">
                <TabsTrigger value="menu">
                    Menu Editor
                </TabsTrigger>
                <TabsTrigger value="allItems">
                    All Items
                </TabsTrigger>
            </TabsList>
            <slot name="top-btns" />
            <TabsContent value="menu">
                <MenuTab />
            </TabsContent>
            <TabsContent value="allItems">
                <h1>AllItemsTab</h1>
            </TabsContent>
        </Tabs>
        <!-- <div v-for="item in modelValue?.children"
             :key="item"
             class="border rounded-md p-4 mb-4">
            <h3>{{ modelValue?.allItems?.[item]?.itemLabel }}</h3>
            <div v-for="itemId in modelValue?.allItems?.[item]?.children"
                 :key="itemId"
                 class="border rounded-md p-4 cursor-pointer mb-4 bg-card hover:bg-accent"
                 @click="() => {
                    previewItem(itemId)
                }">
                <h4>{{ modelValue?.allItems?.[itemId]?.itemLabel }}</h4>
                <span class="text-sm"
                      v-if="modelValue?.allItems?.[itemId]?.price">${{ modelValue?.allItems?.[itemId]?.price }}</span>
            </div>
        </div> -->
    </div>
</template>