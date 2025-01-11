<script lang="ts" setup>
import { currentRestaurant, setCurrentRestaurantId } from './_restaurantStore';
import { RouterView, useRoute } from "vue-router";
const route = useRoute();
const restaurantId = route.params.restaurantId;
setCurrentRestaurantId(restaurantId as string);
</script>

<template>
    <div>
        <RouterLink :to="{ name: 'my-restaurants' }">My Restaurants</RouterLink>
        <h1>Restaurant {{ restaurantId }}</h1>
        currentRestaurant?.name:{{ currentRestaurant?.name }}
        <RouterLink :to="{ name: 'restaurant-home' }">Home</RouterLink>
        <RouterLink :to="{ name: 'restaurant-address' }">Address</RouterLink>
        <RouterView />
    </div>
</template>
