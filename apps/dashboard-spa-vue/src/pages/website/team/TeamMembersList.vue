<script setup lang="ts">
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Shield } from 'lucide-vue-next';
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { type ResType } from '@api-client/ecomApiClient';

const apiPath = dashboardApiClient.api_dashboard.website[':websiteId'].team.$get
type Member = ResType<
    typeof apiPath
>["data"];

defineProps<{
    members: Member;
}>();

</script>

<template>
    <Card class="max-w-lg mx-auto">
        <CardHeader class="pb-2">
            <p class="text-sm text-muted-foreground">Team members can access and manage this website based on their
                permissions</p>
        </CardHeader>
        <CardContent>
            <div class="space-y-4">
                <div v-for="member in members"
                     :key="member.userId"
                     class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                    <div class="flex items-center mb-3 sm:mb-0">
                        <Avatar class="h-10 w-10">
                            <AvatarImage v-if="member.pictureUrl"
                                         :src="member.pictureUrl"
                                         alt="" />
                            <AvatarFallback class="bg-muted">
                                {{ member.name?.slice(0, 4).toUpperCase() }}
                            </AvatarFallback>
                        </Avatar>
                        <div class="ml-4">
                            <div class="font-medium">
                                {{ member.name || 'Unnamed User' }}
                            </div>
                            <div class="text-sm text-muted-foreground flex items-center mt-1">
                                <Mail class="h-3 w-3 mr-1" />
                                {{ member.email }}
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                        <div class="ml-14 sm:ml-0">
                            <Badge v-if="member.isOwner"
                                   variant="default"
                                   class="bg-primary/20 text-primary hover:bg-primary/20">
                                <Shield class="h-3 w-3 mr-1" />
                                Owner
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
</template>
