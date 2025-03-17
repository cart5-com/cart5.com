<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import RestaurantAddressForm from '@src/pages/restaurant/address/RestaurantAddressForm.vue';
import { ArrowRightIcon } from 'lucide-vue-next';
import { pageTitle } from '@src/stores/layout.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

pageTitle.value = 'Address'
</script>

<template>
    <div class="max-w-lg mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Restaurant Address</CardTitle>
                <CardDescription>Enter your restaurant's address</CardDescription>
            </CardHeader>
            <CardContent class="p-6">
                <RestaurantAddressForm />
            </CardContent>
        </Card>
        <RouterLink :to="{ name: 'restaurant-cuisine' }">
            <Button class="mt-4 w-full"
                    variant="secondary">
                Next
                <ArrowRightIcon class="w-4 h-4" />
            </Button>
        </RouterLink>
    </div>
</template>