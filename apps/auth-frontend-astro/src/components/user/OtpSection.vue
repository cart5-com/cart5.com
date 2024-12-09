<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

const otpEnabled = ref(false)

const enableOtp = () => {
    // Implement OTP enabling logic here
    otpEnabled.value = true
}

const disableOtp = () => {
    // Implement OTP disabling logic here
    otpEnabled.value = false
}
</script>

<template>
    <div class="space-y-4">
        <h3 class="text-lg font-medium">Two-Factor Authentication</h3>
        <div v-if="otpEnabled">
            <Alert>
                <AlertTitle>OTP is enabled</AlertTitle>
                <AlertDescription>
                    Your account is protected with two-factor authentication.
                </AlertDescription>
            </Alert>
            <Button variant="outline"
                    class="mt-4"
                    @click="disableOtp">Disable OTP</Button>
        </div>
        <div v-else>
            <p class="text-sm text-gray-500">Enable two-factor authentication for enhanced security.</p>
            <Button class="mt-2"
                    @click="enableOtp">Enable OTP</Button>
        </div>
    </div>
</template>
