<script setup lang="ts">
import { onMounted } from "vue";
import DarkModeToggle from "@/ui-plus/DarkModeToggle.vue";
import UserMenu from "./user/UserMenu.vue";
import { isUserDataReady } from "@web-astro/stores/UserData.store";
import { Loader2 } from "lucide-vue-next";

onMounted(() => {
    console.log("Drawer mounted");
})

</script>

<template>
    <div class="p-1">
        <div v-if="!isUserDataReady">
            <Loader2 class="animate-spin w-20 h-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div v-else>
            <UserMenu />
            <div class="mt-2 flex justify-center">
                <DarkModeToggle />
            </div>
        </div>
    </div>
</template>