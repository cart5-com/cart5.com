<script setup lang="ts">
import { defaultMenuRoot, isMenuLoading, loadMenu, menuRoot, saveMenu } from "./MenuRootStore";
import { loadTaxSettings } from "./TaxSettingsStore";
import MenuTabs from "./MenuTabs.vue";
import { pageTitle } from "@dashboard-spa-vue/stores/LayoutStore";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Check, Hourglass, Shell } from "lucide-vue-next";
import MenuImport from "./components/MenuImport.vue";

pageTitle.value = 'Menu Editor';
let ignoreAutoSave = true;
let isChanged = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const stopWatch = watch([menuRoot], () => {
    if (ignoreAutoSave) return;
    isChanged.value = true;
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
        saveNow()
    }, 3000)
}, { deep: true })


onMounted(async () => {
    ignoreAutoSave = true;
    loadTaxSettings();
    await loadMenu();
    ignoreAutoSave = false;
    // setTimeout(() => {
    // }, 500)
});

onUnmounted(() => {
    ignoreAutoSave = true;
    stopWatch(); // Explicitly stop the watch
    menuRoot.value = defaultMenuRoot;
    if (debounceTimer) {
        clearTimeout(debounceTimer); // Clean up any pending timeout
    }
})

async function saveNow() {
    await saveMenu();
    isChanged.value = false;
}

const isDev = import.meta.env.DEV;

</script>

<template>
    <div class="p-0 md:p-4">
        <MenuTabs v-model="menuRoot">
            <template #top-btns>
                <span class="ml-6 align-middle">
                    <Button @click="saveNow()"
                            variant="secondary"
                            size="sm"
                            :disabled="isMenuLoading">
                        <Shell class="w-4 h-4 animate-spin"
                               v-if="isMenuLoading" />
                        <span v-else>
                            <Check v-if="isChanged === false" />
                            <Hourglass v-else />
                        </span>
                        Auto save
                    </Button>
                    <MenuImport />
                </span>
            </template>
        </MenuTabs>

        <div class="mt-4"
             v-if="isDev">
            <details>
                <summary>menuRoot</summary>
                <pre class="text-xs max-h-96 overflow-y-auto">{{ menuRoot }}</pre>
            </details>
        </div>
    </div>
</template>

<style>
.sortable-chosen {
    border: 1px dashed rgba(var(--primary));
}

.sortable-ghost {
    opacity: 0.5;
    border: 1px dashed rgba(var(--secondary));
}
</style>