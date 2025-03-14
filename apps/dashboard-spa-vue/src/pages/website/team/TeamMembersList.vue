<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, Mail, Shield } from 'lucide-vue-next';

defineProps<{
    members: any[];
    loading: boolean;
    error: string | null;
}>();

// Emit events for future actions
const emit = defineEmits(['invite', 'edit', 'remove']);

const getInitials = (name: string) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

const hasFullAccess = (member: any) => {
    return Array.isArray(member.permissions) &&
        member.permissions.includes('FULL_ACCESS');
};

const hasWebsiteManagerAccess = (member: any) => {
    return Array.isArray(member.permissions) &&
        member.permissions.includes('WEBSITE_MANAGER');
};

</script>

<template>
    <Card class="team-members-list shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle>Team Members</CardTitle>
            <Button size="sm"
                    variant="outline"
                    @click="emit('invite')">
                <UserPlus class="h-4 w-4 mr-2" />
                Invite Member
            </Button>
        </CardHeader>
        <CardContent>
            <div v-if="loading"
                 class="flex justify-center py-4">
                <Loader2 class="h-8 w-8 animate-spin" />
            </div>

            <div v-else-if="error"
                 class="bg-destructive/15 text-destructive border border-destructive/30 px-4 py-3 rounded">
                {{ error }}
            </div>

            <div v-else-if="members.length === 0"
                 class="text-muted-foreground py-4 text-center">
                No team members found.
            </div>

            <Table v-else>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead class="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="member in members"
                              :key="member.userId">
                        <TableCell>
                            <div class="flex items-center">
                                <Avatar class="h-10 w-10">
                                    <AvatarImage v-if="member.pictureUrl"
                                                 :src="member.pictureUrl"
                                                 alt="" />
                                    <AvatarFallback class="bg-muted">
                                        {{ getInitials(member.name || member.email) }}
                                    </AvatarFallback>
                                </Avatar>
                                <div class="ml-4">
                                    <div class="font-medium">
                                        {{ member.name || 'Unnamed User' }}
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell class="text-muted-foreground">
                            <div class="flex items-center">
                                <Mail class="mr-2" />
                                {{ member.email }}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge v-if="member.isOwner"
                                   variant="default"
                                   class="bg-primary/20 text-primary hover:bg-primary/20">
                                <Shield />
                                Owner
                            </Badge>
                            <Badge v-else-if="hasFullAccess(member)"
                                   variant="default"
                                   class="bg-primary/20 text-primary hover:bg-primary/20">
                                <Shield />
                                Admin
                            </Badge>
                            <Badge v-else-if="hasWebsiteManagerAccess(member)"
                                   variant="default"
                                   class="bg-accent text-accent-foreground hover:bg-accent">
                                Manager
                            </Badge>
                            <Badge v-else
                                   variant="default"
                                   class="bg-muted text-muted-foreground hover:bg-muted">
                                Member
                            </Badge>
                        </TableCell>
                        <TableCell class="text-right">
                            <div class="space-x-2">
                                <Button v-if="!member.isOwner"
                                        variant="outline"
                                        size="sm"
                                        @click="emit('edit', member)">
                                    Edit
                                </Button>
                                <Button v-if="!member.isOwner"
                                        variant="destructive"
                                        size="sm"
                                        @click="emit('remove', member)">
                                    Remove
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
    </Card>
</template>
