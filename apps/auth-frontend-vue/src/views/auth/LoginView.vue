<script setup lang="ts">
import LoginForm from '@src/components/forms/auth-forms/LoginForm.vue';
import GoogleButton from "@src/components/GoogleButton.vue";
import { Card, CardContent } from "@/components/ui/card";
import Separator from "@/ui-plus/separator/Separator.vue";
import { queryParamsStore, getQueryParams } from '@src/stores/queryParamsStore'

const onForgotPasswordClick = () => {
    const queryParams = getQueryParams();
    queryParams.auth = "otp";
    queryParamsStore.value = queryParams;
}
</script>

<template>
    <Card>
        <CardContent class="my-6">
            <LoginForm />
            <div class="text-center">
                <button variant="link"
                        @click="onForgotPasswordClick"
                        class="ml-auto inline-block text-sm underline">
                    Forgot password?
                </button>
            </div>
            <Separator class="my-10"
                       label="Or" />
            <GoogleButton />
        </CardContent>
    </Card>
</template>