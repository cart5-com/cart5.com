<template>
    <Card>
        <CardHeader>
            <CardTitle>Your account settings</CardTitle>
            <CardDescription>Manage your account settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
            <div class="space-y-6">
                <OtpSection />
                <Separator class="my-4" />
                <ChangePasswordSection />
                <Separator class="my-4" />
                <ChangeNameSection />
            </div>
        </CardContent>
    </Card>
</template>

<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import OtpSection from './OtpSection.vue'
import ChangePasswordSection from './ChangePasswordSection.vue'
import ChangeNameSection from './ChangeNameSection.vue'
import { Separator } from '@/components/ui/separator'
</script>