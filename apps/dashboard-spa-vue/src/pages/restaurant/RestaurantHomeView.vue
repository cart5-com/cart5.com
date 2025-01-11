<script lang="ts" setup>
import { currentRestaurant } from './_restaurantStore';
</script>

<template>
    <div>
        <h1>Restaurant Home</h1>
        {{ currentRestaurant?.name }}
    </div>
</template>