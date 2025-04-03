<script setup lang="ts">
import { onMounted } from "vue";
import DarkModeToggle from "@/ui-plus/DarkModeToggle.vue";
import UserMenu from "./user/UserMenu.vue";

onMounted(() => {
    console.log("Drawer mounted");
})

</script>

<template>
    <div class="p-1">
        <UserMenu />
        <DarkModeToggle />
    </div>
</template>