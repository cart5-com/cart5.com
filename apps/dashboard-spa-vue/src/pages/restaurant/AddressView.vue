<script lang="ts" setup>
import { currentRestaurant } from '@src/stores/RestaurantStore';
import Sample from '@/ui-plus/auto-complete/Sample.vue';
</script>

<template>
    <div>
        <h1>Restaurant Address</h1>
        {{ currentRestaurant?.name }}
    </div>
    <div>
        <Sample />
    </div>
</template>