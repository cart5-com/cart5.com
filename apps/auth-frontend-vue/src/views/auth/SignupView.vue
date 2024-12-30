<script setup lang="ts">
import { ROUTES } from "@src/const";
import Logo from '@src/components/Logo.vue';
import SignupForm from '@src/components/forms/auth-forms/signup/SignupForm.vue';
import AuthMenu from '@src/components/AuthMenu.vue';
import GoogleButton from "@src/components/GoogleButton.vue";
import { Card, CardContent } from "@/components/ui/card";
import Separator from "@/ui-plus/separator/Separator.vue";
</script>

<template>
    <div class="container max-w-lg mx-auto px-4">
        <Logo />
        <AuthMenu :active-route="ROUTES.SIGNUP" />
        <Card>
            <CardContent class="my-6">
                <SignupForm />
                <Separator class="my-10"
                           label="Or" />
                <GoogleButton />
            </CardContent>
        </Card>
    </div>
</template>