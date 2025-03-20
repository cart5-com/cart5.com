<script lang="ts" setup>
import WebsiteNameForm from './WebsiteNameForm.vue';
import { pageTitle } from '@dashboard-spa-vue/stores/layout.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

pageTitle.value = 'Website Name'
</script>

<template>
    <div class="max-w-lg mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Website Name</CardTitle>
                <CardDescription>Update your website name settings</CardDescription>
            </CardHeader>
            <CardContent class="p-6">
                <WebsiteNameForm />
            </CardContent>
        </Card>
    </div>
</template>