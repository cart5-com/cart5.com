<template>
    <Card>
        <CardHeader class="space-y-1">
            <CardTitle class="text-3xl font-bold">Sign in to
                <span class="uppercase">{{ OtherSideDomain }}</span>
            </CardTitle>
            <Separator class="my-4" />
            <CardDescription>
                By continuing,
                <span class="font-bold">{{ PUBLIC_DOMAIN_NAME }}</span>
                will share your name, email address with
                <span class="font-bold">{{ OtherSideDomain }}</span>.
                You can manage your
                <span class="font-bold">{{ PUBLIC_DOMAIN_NAME }}</span>
                in settings.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div class="flex items-center p-4 space-x-4 bg-accent rounded-lg border border-border/50 shadow-sm">
                <Avatar class="w-12 h-12 border-2 border-primary/20">
                    <AvatarImage :src="userStore.user?.pictureUrl || ``" />
                    <AvatarFallback>
                        {{ userStore.user?.name?.slice(0, 2).toUpperCase() }}
                    </AvatarFallback>
                </Avatar>
                <div class="flex-1">
                    <p class="font-semibold text-foreground">{{ userStore.user?.name }}</p>
                    <p class="text-sm text-muted-foreground">{{ userStore.user?.email }}</p>
                </div>
            </div>
            <Button class="w-full mt-6 font-medium"
                    size="lg"
                    @click="navigateToMainSite">
                Continue
                <ArrowBigRight />
            </Button>
            <Button class="w-full mt-4"
                    variant="outline"
                    @click="navigateToMainSite">
                Cancel
            </Button>
        </CardContent>
    </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { userStore } from '../userStore'
import { Button } from '@/components/ui/button'
import { ArrowBigRight } from 'lucide-vue-next';
import { Separator } from '@/components/ui/separator';

const navigateToMainSite = () => {
    // window.location.href = 'https://www.otherside.com'
}
const { PUBLIC_DOMAIN_NAME } = import.meta.env;
const OtherSideDomain = document.referrer.split('/')[2] || 'www.otherside.com'

</script>