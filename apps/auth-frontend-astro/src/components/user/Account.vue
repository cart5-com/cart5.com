<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import OtpSection from './OtpSection.vue'
import ChangePasswordSection from './ChangePasswordSection.vue'
import ChangeNameSection from './ChangeNameSection.vue'
import { Separator } from '@/components/ui/separator'
import DarkModeToggle from 'ui-shadcn-vue/src/ui-plus/DarkModeToggle.vue'
import UserDetails from './UserDetails.vue'
import { getReturnBackHostname, getReturnBackUrl } from '../queryHelpers';
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-vue-next'
const returnBackUrl = getReturnBackUrl();
const returnBackHostname = getReturnBackHostname();
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>
                Your account settings
            </CardTitle>
            <CardDescription>Manage your account settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
            <div class="space-y-6">
                <UserDetails />
                <Button variant="outline"
                        v-if="returnBackUrl"
                        as="a"
                        class="w-full"
                        :href="returnBackUrl">
                    <ChevronLeft class="w-4 h-4" /> return back to {{ returnBackHostname }}
                </Button>
                <Separator class="my-4" />
                <OtpSection />
                <Separator class="my-4" />
                <ChangePasswordSection />
                <Separator class="my-4" />
                <ChangeNameSection />
                <Separator class="my-4" />
                <DarkModeToggle client:load />
            </div>
        </CardContent>
    </Card>
</template>
