<script lang="ts" setup>
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import MenuTab from './tabs/MenuTab.vue';
import AllItemsTab from './tabs/AllItemsTab.vue';



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
                <AllItemsTab />
            </TabsContent>
        </Tabs>
    </div>
</template>