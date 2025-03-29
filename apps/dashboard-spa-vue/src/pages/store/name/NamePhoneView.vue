<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import StoreNamePhoneForm from '@dashboard-spa-vue/pages/store/name/StoreNamePhoneForm.vue';
import { ArrowRightIcon } from 'lucide-vue-next';
import { pageTitle } from '@dashboard-spa-vue/stores/layout.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

pageTitle.value = 'Name & Phone'
</script>

<template>
    <div class="max-w-lg mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Store Name & Phone</CardTitle>
                <CardDescription>Enter your store's name and phone number</CardDescription>
            </CardHeader>
            <CardContent class="p-6">
                <StoreNamePhoneForm />
            </CardContent>
        </Card>
        <RouterLink :to="{ name: 'store-address' }">
            <Button class="mt-4 w-full"
                    variant="secondary">
                Next
                <ArrowRightIcon class="w-4 h-4" />
            </Button>
        </RouterLink>
    </div>
</template>
