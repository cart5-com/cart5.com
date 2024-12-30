<script setup lang="ts">
import { ROUTES } from "@src/const";
import Logo from '@src/components/Logo.vue';
import LoginForm from '@src/components/forms/auth-forms/LoginForm.vue';
import AuthMenu from '@src/components/AuthMenu.vue';
import GoogleButton from "@src/components/GoogleButton.vue";
import { Card, CardContent } from "@/components/ui/card";
import Separator from "@/ui-plus/separator/Separator.vue";
import { buttonVariants } from "@/components/ui/button";
import QueryLink from "@src/components/QueryLink.vue";
</script>

<template>
    <div class="container max-w-lg mx-auto px-4">
        <Logo />
        <AuthMenu :active-route="ROUTES.LOGIN" />
        <Card>
            <CardContent class="my-6">
                <LoginForm />
                <QueryLink :to="ROUTES.OTP"
                           :class="buttonVariants({ size: 'lg', variant: 'secondary' }) + ' my-6 w-full'">
                    Forgot password?
                </QueryLink>
                <Separator class="my-10"
                           label="Or" />
                <GoogleButton />
            </CardContent>
        </Card>
    </div>
</template>