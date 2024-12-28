<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();

const goToAbout = () => {
    router.push({ name: "about" });
};
</script>

<template>
    <h2>HomeView</h2>
    <button @click="goToAbout">Go to About</button>
</template>