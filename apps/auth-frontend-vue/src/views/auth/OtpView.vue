<script setup lang="ts">
import OtpForm from '@auth-frontend-vue/components/forms/auth-forms/otp/OTPForm.vue';
import GoogleButton from "@auth-frontend-vue/components/GoogleButton.vue";
import { Card, CardContent } from "@/components/ui/card";
import Separator from "@/ui-plus/separator/Separator.vue";
</script>

<template>
    <Card>
        <CardContent class="my-6">
            <OtpForm />
            <Separator class="my-10"
                       label="Or" />
            <GoogleButton />
        </CardContent>
    </Card>
</template>