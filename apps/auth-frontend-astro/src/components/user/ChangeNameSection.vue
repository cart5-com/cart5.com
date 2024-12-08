<template>
    <div class="space-y-4">
        <h3 class="text-lg font-medium">Change Name</h3>
        <form @submit.prevent="changeName"
              class="space-y-4">
            <div class="space-y-2">
                <Label for="new-name">New Name</Label>
                <Input id="new-name"
                       type="text"
                       v-model="newName"
                       required />
            </div>
            <Button type="submit">Update Name</Button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const newName = ref('')

const changeName = () => {
    // Implement name change logic here
    console.log('Changing name to:', newName.value)
    // Reset form field after submission
    newName.value = ''
}
</script>