<script lang="ts" setup>
import { currentRestaurant } from '@src/stores/RestaurantStore';
import { mapsApiClient } from '@src/lib/dashboardApiClient';
import { Button } from '@/components/ui/button';

const getAddress = async () => {
    const { data, error } = await (await mapsApiClient.api.maps.gmaps.autocomplete.$get({
        query: {
            input: 'main street',
        }
    })).json();
    console.log(data, error);
}

</script>

<template>
    <div>
        <h1>Restaurant Address</h1>
        {{ currentRestaurant?.name }}
        <Button @click="getAddress">Get Address</Button>
    </div>
</template>