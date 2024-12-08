<template>
    <div class="space-y-4">
        <h3 class="text-lg font-medium">Change Password</h3>
        <form @submit.prevent="changePassword"
              class="space-y-4">
            <div class="space-y-2">
                <Label for="new-password">New Password</Label>
                <Input id="new-password"
                       type="password"
                       v-model="newPassword"
                       required />
            </div>
            <div class="space-y-2">
                <Label for="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password"
                       type="password"
                       v-model="confirmPassword"
                       required />
            </div>
            <Button type="submit">Change Password</Button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const changePassword = () => {
    // Implement password change logic here
    console.log('Changing password...')
    // Reset form fields after submission
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
}
</script>