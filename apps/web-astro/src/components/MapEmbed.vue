<script setup lang="ts">

const props = defineProps<{
    storeLat: number;
    storeLng: number;
    destinationLat: number | undefined;
    destinationLng: number | undefined;
    isLink: boolean;
}>();

function getMapUrl(
): string {
    if (
        props.storeLat && props.storeLng &&
        props.destinationLat && props.destinationLng
    ) {
        return `https://www.google.com/maps/embed/v1/directions?` +
            `destination=${props.destinationLat},${props.destinationLng}` +
            `&origin=${props.storeLat},${props.storeLng}` +
            `&mode=bicycling` +
            `&key=${import.meta.env.PUBLIC_GMAPS_EMBED_API_KEY}`;
    } else if (props.storeLat && props.storeLng) {
        return `https://www.google.com/maps/embed/v1/search?` +
            `q=${props.storeLat},${props.storeLng}&zoom=16` +
            `&key=${import.meta.env.PUBLIC_GMAPS_EMBED_API_KEY}`;
    }
    return '';
}

function getMapLink(
): string {
    if (
        props.storeLat && props.storeLng &&
        props.destinationLat && props.destinationLng
    ) {
        return `https://www.google.com/maps/dir/?api=1&` +
            `destination=${props.destinationLat},${props.destinationLng}` +
            `&travelmode=bicycling` +
            `&origin=${props.storeLat},${props.storeLng}`;
    } else if (props.storeLat && props.storeLng) {
        return `https://www.google.com/maps/search/?api=1&` +
            `query=${props.storeLat},${props.storeLng}`;
    }
    return '';
}

</script>
<template>
    <a target="_blank"
       :style="{
        'pointer-events': isLink ? 'auto' : 'none',
    }"
       :href="getMapLink()">
        <iframe width="100%"
                height="500"
                class="rounded-lg"
                frameborder="0"
                style="border:0;zoom: 0.6;transform: scale(1.9);pointer-events: none;transform-origin: center center;"
                referrerpolicy="no-referrer-when-downgrade"
                allowfullscreen="false"
                :src="getMapUrl()">
        </iframe>
    </a>
</template>