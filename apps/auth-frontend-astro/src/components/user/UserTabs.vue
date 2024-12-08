<template>
    <div class="min-h-screen">

        <Tabs default-value="website"
              class="w-full">
            <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="website">www.otherside.com</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="settings">
                <Settings />
            </TabsContent>
            <TabsContent value="website">
                <CrossDomainAuth />
            </TabsContent>
        </Tabs>
    </div>
</template>

<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Settings from './Settings.vue'
import CrossDomainAuth from './CrossDomainAuth.vue';
</script>