<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { getRedirectUrl, getReturnBackUrl } from '../queryHelpers';

const goBack = () => {
    const redirectUrl = getRedirectUrl();
    const returnBackUrl = getReturnBackUrl();
    if (redirectUrl) {
        window.location.href = redirectUrl;
    } else if (returnBackUrl) {
        window.location.href = returnBackUrl;
    } else {
        window.history.back();
    }
}
</script>

<template>
    <Button variant="outline"
            class="w-full mt-4"
            @click="goBack">
        Cancel
    </Button>
</template>
