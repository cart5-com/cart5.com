<script lang="ts" setup>
import { currentRestaurant } from './_restaurantStore';
</script>

<template>
    <div>
        <h1>Restaurant Address</h1>
        {{ currentRestaurant?.name }}
    </div>
</template>