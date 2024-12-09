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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="outline"
                                    v-if="returnBackUrl"
                                    as="a"
                                    :href="returnBackUrl">
                                <ChevronLeft class="w-4 h-4" /> {{ returnBackHostname }}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>return back to `{{ returnBackHostname }}`</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>


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
