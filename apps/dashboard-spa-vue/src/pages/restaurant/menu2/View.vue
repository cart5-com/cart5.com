<script setup lang="ts">
import { menu2Store } from "./store";
import MenuEditor2 from "./MenuEditor2.vue";
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold p-4 border-b mb-2">Menu editor2</h1>
        <div class="border rounded-md p-2">
            <MenuEditor2 v-model="menu2Store" />
        </div>
    </div>
</template>