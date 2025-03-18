<script setup lang="ts">
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Shield, Crown, UserMinus, MoreVertical } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { apiClient, type ResType } from '@api-client/index';

const apiPath = apiClient.dashboard.restaurant[':restaurantId'].team.$get
type Member = ResType<typeof apiPath>["data"][0];

defineProps<{
    member: Member;
    isCurrentUser: boolean;
    canManageTeam: boolean;
    isOwner: boolean;
}>();

const emit = defineEmits(['transfer-ownership', 'remove-member', 'edit-permissions']);
</script>

<template>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
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
            <div class="ml-14 sm:ml-0 flex gap-2 items-center">
                <Badge v-if="member.isOwner"
                       variant="default"
                       class="bg-primary/20 text-primary hover:bg-primary/20">
                    <Shield class="h-3 w-3 mr-1" />
                    Owner
                </Badge>

                <!-- Actions Dropdown -->
                <DropdownMenu v-if="!isCurrentUser && (canManageTeam || isOwner)">
                    <DropdownMenuTrigger as-child>
                        <Button variant="ghost"
                                size="sm"
                                class="h-8 w-8 p-0">
                            <MoreVertical class="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <!-- Transfer ownership option -->
                        <DropdownMenuItem v-if="isOwner && !member.isOwner"
                                          @click="emit('transfer-ownership', member)"
                                          class="flex items-center gap-2">
                            <Crown class="h-4 w-4" />
                            Make Owner
                        </DropdownMenuItem>

                        <!-- Edit permissions option -->
                        <DropdownMenuItem v-if="canManageTeam && !member.isOwner"
                                          @click="emit('edit-permissions', member)"
                                          class="flex items-center gap-2">
                            <Shield class="h-4 w-4" />
                            Edit Permissions
                        </DropdownMenuItem>

                        <!-- Remove member option -->
                        <DropdownMenuItem v-if="canManageTeam && !member.isOwner"
                                          @click="emit('remove-member', member)"
                                          class="flex items-center gap-2 text-destructive">
                            <UserMinus class="h-4 w-4" />
                            Remove Member
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    </div>
</template>