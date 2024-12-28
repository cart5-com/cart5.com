<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

defineOptions({
    inheritAttrs: false,
})

const props = defineProps({
    // ...RouterLink.props,
    // inactiveClass: String,
    to: {
        type: [String, Object],
        required: true
    },
    activeClass: String,
    inactiveClass: String,
})

const route = useRoute()

// Compute the final 'to' prop that includes query params
const linkTo = computed(() => {
    if (typeof props.to === 'string') {
        return {
            path: props.to,
            query: route.query
        }
    }
    // If 'to' is already an object, merge the queries
    return {
        ...props.to,
        query: {
            ...route.query,
            ...(props.to.query || {})
        }
    }
})
</script>

<template>
    <router-link v-bind="$props"
                 :to="linkTo"
                 custom
                 v-slot="{ isActive, href, navigate }">
        <a v-bind="$attrs"
           :href="href"
           @click="navigate"
           :class="isActive ? activeClass : inactiveClass">
            <slot />
        </a>
    </router-link>
</template>