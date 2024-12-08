<template>
    <div class="min-h-screen">

        <Tabs default-value="website"
              class="w-full">
            <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="website">{{ OtherSideDomain }}</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
                <Account />
            </TabsContent>
            <TabsContent value="website">
                <CrossDomainAuth />
            </TabsContent>
        </Tabs>
    </div>
</template>

<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Account from './Account.vue'
import CrossDomainAuth from './CrossDomainAuth.vue';
import { getRedirectHostname } from 'src/components/queryHelpers';
const OtherSideDomain = getRedirectHostname();
</script>