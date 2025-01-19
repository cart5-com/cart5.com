<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import RestaurantAddressForm from '@src/pages/restaurant/forms/RestaurantAddressForm.vue';
import { ArrowRightIcon } from 'lucide-vue-next';
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold">What is your restaurant's address?</h1>
        <div class="max-w-lg mx-auto pt-10">
            <RestaurantAddressForm />
            <RouterLink :to="{ name: 'restaurant-cuisine' }">
                <Button class="mt-4 w-full"
                        variant="secondary">
                    Next
                    <ArrowRightIcon class="w-4 h-4" />
                </Button>
            </RouterLink>
        </div>
    </div>
</template>