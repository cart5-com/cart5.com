<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import RestaurantNamePhoneForm from '@dashboard-spa-vue/pages/restaurant/name/RestaurantNamePhoneForm.vue';
import { ArrowRightIcon } from 'lucide-vue-next';
import { pageTitle } from '@dashboard-spa-vue/stores/layout.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

pageTitle.value = 'Name & Phone'
</script>

<template>
    <div class="max-w-lg mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Restaurant Name & Phone</CardTitle>
                <CardDescription>Enter your restaurant's name and phone number</CardDescription>
            </CardHeader>
            <CardContent class="p-6">
                <RestaurantNamePhoneForm />
            </CardContent>
        </Card>
        <RouterLink :to="{ name: 'restaurant-address' }">
            <Button class="mt-4 w-full"
                    variant="secondary">
                Next
                <ArrowRightIcon class="w-4 h-4" />
            </Button>
        </RouterLink>
    </div>
</template>
