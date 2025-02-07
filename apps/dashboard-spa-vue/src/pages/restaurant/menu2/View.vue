<script setup lang="ts">
import { menu2Store } from "./store";
import MenuEditor2 from "./MenuEditor2.vue";
</script>

<template>
    <div>
        <div class="border rounded-md p-4">
            <MenuEditor2 v-model="menu2Store" />
        </div>
    </div>
</template>