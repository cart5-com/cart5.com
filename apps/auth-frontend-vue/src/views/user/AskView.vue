<script setup lang="ts">
import { onMounted } from 'vue';
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { toast } from "@/ui-plus/sonner";
import { showTurnstile } from "@/ui-plus/dialog/showTurnstile";
import { useDialog } from "@/ui-plus/dialog/use-dialog";
import { createAuthApiClient } from "@api-client/auth";
import { getNextUrl, getNextHostname } from "@auth-frontend-vue/lib/queryHelpers";
import { userStore } from '@auth-frontend-vue/stores/User.store';
import UserCard from "@/ui-plus/UserCard.vue";

const dialog = useDialog();
const crossDomainHostname = getNextHostname();

const showErrorToast = () => {
    toast.error("Unable to get redirect url", {
        description: "Please go back to the previous website then try again",
        action: {
            label: "Go back",
            onClick: () => {
                window.history.back();
            }
        }
    });
};

const redirectWithUser = async () => {
    const redirectUrl = getNextUrl();
    if (!redirectUrl) {
        showErrorToast();
        return;
    }
    const turnstile = await showTurnstile(import.meta.env.VITE_PUBLIC_TURNSTILE_SITE_KEY);
    dialog.showBlockingLoadingModal();
    const postActionUrl = createAuthApiClient(`${window.location.origin}/__p_api/auth/`).cross_domain.redirector.$url();
    const newForm = document.createElement("form");
    newForm.method = "POST";
    newForm.action = postActionUrl.toString();
    const inputRedirectUrl = document.createElement("input");
    inputRedirectUrl.name = "redirectUrl";
    inputRedirectUrl.value = redirectUrl;
    const inputTurnstile = document.createElement("input");
    inputTurnstile.name = "turnstile";
    inputTurnstile.value = turnstile;
    newForm.appendChild(inputRedirectUrl);
    newForm.appendChild(inputTurnstile);
    newForm.style.display = "none";
    document.body.appendChild(newForm);
    newForm.submit();
};

onMounted(() => {
    const continueButton = document.querySelector(".continue-button") as HTMLButtonElement;
    if (crossDomainHostname && continueButton) {
        continueButton.innerHTML = `Continue to <b><u>${crossDomainHostname}</u></b>`;
    }

    setTimeout(() => {
        toast.success("Welcome back", {
            description: "Click continue to use your account"
        });
        if (import.meta.env.VITE_PUBLIC_AUTH_AUTO_REDIRECT === "1") {
            redirectWithUser();
        }
    }, 500);
});
</script>

<template>
    <Card>
        <CardContent class="my-6">
            <UserCard :user="userStore" />

            <button :class="[buttonVariants({ variant: 'default' }), 'mt-6 w-full font-medium continue-button']"
                    @click="redirectWithUser">
                Continue
            </button>
        </CardContent>
    </Card>
</template>