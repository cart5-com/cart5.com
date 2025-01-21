<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import RestaurantNamePhoneForm from '@src/pages/restaurant/forms/RestaurantNamePhoneForm.vue';
import { ArrowRightIcon } from 'lucide-vue-next';
import { pageTitle } from '@src/stores/layout.store';

pageTitle.value = 'Name & Phone'
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold">What is your restaurant's name?</h1>
        <div class="max-w-lg mx-auto pt-10">
            <RestaurantNamePhoneForm />
            <RouterLink :to="{ name: 'restaurant-address' }">
                <Button class="mt-4 w-full"
                        variant="secondary">
                    Next
                    <ArrowRightIcon class="w-4 h-4" />
                </Button>
            </RouterLink>
        </div>
    </div>
</template>
