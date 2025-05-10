<script setup lang="ts">
import { Printer } from 'lucide-vue-next';
// import { ref } from 'vue';
// import Button from '@/components/ui/button/Button.vue';
import DarkModeToggle from '@/ui-plus/DarkModeToggle.vue';

// const btnClick = () => {
//     alert('hello');
// }
</script>

<template>
    <div>
        <h1 class="text-3xl font-bold p-4">
            <Printer class="inline-block mr-2" />
            Auto Print
        </h1>
        <DarkModeToggle />
    </div>
</template>