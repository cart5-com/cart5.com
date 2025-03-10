<script lang="ts" setup>
import { pageTitle } from '@src/stores/layout.store';

pageTitle.value = 'Domains'
</script>

<template>
    <div class="space-y-6">
        <div>
            <h3 class="text-lg font-medium">Domain management</h3>
            <p class="text-sm text-muted-foreground">
                Use your own domain for free.
            </p>
        </div>
    </div>
</template>