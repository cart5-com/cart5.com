<script setup lang="ts">
import { defaultMenuRoot, loadMenu, menuRoot, saveMenu } from "./store";
import MenuEditor2 from "./MenuEditor2.vue";
import { pageTitle } from "@src/stores/layout.store";
import { onMounted, onUnmounted, watch } from "vue";

pageTitle.value = 'Menu Editor 2';

let ignoreAutoSave = true;
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const stopWatch = watch([menuRoot], () => {
    if (ignoreAutoSave) return;
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
        saveMenu()
    }, 3000)
}, { deep: true, immediate: true })


onMounted(async () => {
    ignoreAutoSave = true;
    await loadMenu();
    setTimeout(() => {
        ignoreAutoSave = false;
    }, 500)
});

onUnmounted(() => {
    ignoreAutoSave = true;
    stopWatch(); // Explicitly stop the watch
    menuRoot.value = defaultMenuRoot;
    if (debounceTimer) {
        clearTimeout(debounceTimer); // Clean up any pending timeout
    }
})

</script>

<template>
    <div>
        <div class="border rounded-md p-4">
            <MenuEditor2 v-model="menuRoot" />
        </div>
    </div>
</template>