<script setup lang="ts">
import { onMounted } from "vue";
import DarkModeToggle from "@/ui-plus/DarkModeToggle.vue";

onMounted(() => {
    console.log("Drawer mounted");
})

</script>

<template>
    <div>
        <DarkModeToggle />
    </div>
</template>