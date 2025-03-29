<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import StoreAddressForm from '@dashboard-spa-vue/pages/store/address/StoreAddressForm.vue';
import { ArrowRightIcon } from 'lucide-vue-next';
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

pageTitle.value = 'Address'
</script>

<template>
    <div class="max-w-lg mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Store Address</CardTitle>
                <CardDescription>Enter your store's address</CardDescription>
            </CardHeader>
            <CardContent class="p-6">
                <StoreAddressForm />
            </CardContent>
        </Card>
        <RouterLink :to="{ name: 'store-cuisine' }">
            <Button class="mt-4 w-full"
                    variant="secondary">
                Next
                <ArrowRightIcon class="w-4 h-4" />
            </Button>
        </RouterLink>
    </div>
</template>