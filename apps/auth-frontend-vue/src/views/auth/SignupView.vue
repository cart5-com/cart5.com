<script setup lang="ts">
import SignupForm from '@auth-frontend-vue/components/forms/auth-forms/signup/SignupForm.vue';
import GoogleButton from "@auth-frontend-vue/components/GoogleButton.vue";
import { Card, CardContent } from "@/components/ui/card";
import Separator from "@/ui-plus/separator/Separator.vue";
</script>

<template>
    <Card>
        <CardContent class="my-6">
            <SignupForm />
            <Separator class="my-10"
                       label="Or" />
            <GoogleButton />
        </CardContent>
    </Card>
</template>