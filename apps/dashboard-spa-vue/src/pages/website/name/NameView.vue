<script lang="ts" setup>
import WebsiteNameForm from './WebsiteNameForm.vue';
import { pageTitle } from '@src/stores/layout.store';

pageTitle.value = 'Name'
</script>

<template>
    <div class="space-y-6">
        <div>
            <h3 class="text-lg font-medium">Website Name</h3>
            <p class="text-sm text-muted-foreground">
                Update your website name settings.
            </p>
        </div>
        <WebsiteNameForm />
    </div>
</template>