<script setup lang="ts">
import { defaultMenuRoot, loadMenu, menuRoot, saveMenu } from "./store";
import MenuEditor from "./MenuEditor.vue";
import { pageTitle } from "@src/stores/layout.store";
import { onMounted, onUnmounted, watch } from "vue";
pageTitle.value = 'Menu Editor';
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
        <MenuEditor v-model="menuRoot" />
    </div>
</template>