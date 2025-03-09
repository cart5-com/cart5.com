<script lang="ts" setup>
import WebsiteDomainsManager from './WebsiteDomainsManager.vue';
import { pageTitle } from '@src/stores/layout.store';

pageTitle.value = 'Domains'
</script>

<template>
    <div class="space-y-6">
        <div>
            <h3 class="text-lg font-medium">Website Domains</h3>
            <p class="text-sm text-muted-foreground">
                Manage your website domains and set the default domain.
            </p>
        </div>
        <WebsiteDomainsManager />
    </div>
</template>