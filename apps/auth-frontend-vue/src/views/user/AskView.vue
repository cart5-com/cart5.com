<script setup lang="ts">
import { onMounted } from 'vue';
import { Card, CardContent } from "@/components/ui/card";
import UserDetails from "@src/components/forms/UserDetails.vue";
import { buttonVariants } from "@/components/ui/button";
import { toast } from "@/ui-plus/sonner";
import { showTurnstile } from "@/ui-plus/dialog/showTurnstile";
import { useDialog } from "@/ui-plus/dialog/use-dialog";
import { createAuthApiClient_AsUrlHelper } from "@src/lib/authApiClient";
import { getNextUrl, getNextHostname } from "@src/lib/queryHelpers";

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
    const postActionUrl = createAuthApiClient_AsUrlHelper().api_auth.cross_domain.redirector.$url();
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
            <UserDetails />
            <button :class="[buttonVariants({ variant: 'default' }), 'mt-6 w-full font-medium continue-button']"
                    @click="redirectWithUser">
                Continue
            </button>
        </CardContent>
    </Card>
</template>