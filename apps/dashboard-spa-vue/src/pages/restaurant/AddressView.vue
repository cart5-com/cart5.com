<script lang="ts" setup>
import { currentRestaurant } from '@src/stores/RestaurantStore';
</script>

<template>
    <div>
        <h1>Restaurant Address</h1>
        {{ currentRestaurant?.name }}
    </div>
</template>