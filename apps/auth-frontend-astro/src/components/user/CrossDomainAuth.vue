<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getRedirectHostname, getRedirectUrl } from '../queryHelpers';
import { showTurnstile } from '@/ui-plus/dialog/showTurnstile';
import { authApiClient } from '../authApiClient';
import UserDetails from './UserDetails.vue';
import CancelGoBackButton from '../auth/CancelGoBackButton.vue';

const navigateToMainSite = async () => {
    if (!redirectUrl) {
        alert("redirectUrl is not found");
        return;
    }
    const turnstile = await showTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY);
    const postActionUrl = authApiClient.api.cross_domain.redirector.$url();
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
}
const crossDomainHostname = getRedirectHostname();
const redirectUrl = getRedirectUrl();

</script>

<template>
    <Card>
        <CardHeader class="space-y-1">
            <CardTitle class="text-3xl font-bold">Sign in to
                <span class="underline">{{ crossDomainHostname }}</span>
            </CardTitle>
            <!-- <Separator class="my-4" /> -->
            <!-- <CardDescription>
                Before you continue, here's what you need to know:
                <ul class="my-6 ml-6 list-disc [&>li]:mt-2">
                    <li><span class="font-bold">{{ PUBLIC_DOMAIN_NAME }}</span> protects your personal information</li>
                    <li>only essential information (like your shipping address) shared with <span
                              class="font-bold">{{ crossDomainHostname }}</span></li>
                    <li>You can manage what's shared in your account settings anytime</li>
                </ul>
            </CardDescription> -->
        </CardHeader>
        <CardContent>
            <UserDetails />
            <Button class="w-full mt-6 font-medium"
                    size="lg"
                    @click="navigateToMainSite">
                Continue to {{ crossDomainHostname }}
            </Button>
            <CancelGoBackButton />
        </CardContent>
    </Card>
</template>
