<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Account from './Account.vue'
import CrossDomainAuth from './CrossDomainAuth.vue';
import { getRedirectHostname, getRedirectUrl } from '../queryHelpers';
const crossDomainHostname = getRedirectHostname();
const redirectUrl = getRedirectUrl();
</script>

<template>
    <div class="min-h-screen">

        <Tabs :default-value="redirectUrl ? 'website' : 'account'"
              class="w-full">
            <TabsList class="grid w-full grid-cols-2"
                      v-if="redirectUrl">
                <TabsTrigger v-if="redirectUrl"
                             value="website">{{ crossDomainHostname }}</TabsTrigger>
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
