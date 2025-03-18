<script setup lang="ts">
import { CircleUser } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getSettingsUrl } from "@lib/clientUtils/getAuthOrigin";
import { apiClient } from "@api-client/index";
import DarkModeToggleSubMenu from "@/ui-plus/DarkModeToggleSubMenu.vue";
const user = window.USER;
function goToAccountSettings() {
    window.location.href = getSettingsUrl(import.meta.env.VITE_PUBLIC_DOMAIN_NAME)
}

async function logout() {
    const { data, error } = await (await apiClient.auth_global['logout-all'].$post()).json();
    console.log(data, error);
    window.location.href = `/dash/after-logout.html`;
}

</script>
<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button variant="secondary"
                    size="icon"
                    class="rounded-full">
                <CircleUser class="h-5 w-5" />
                <span class="sr-only">Toggle user menu</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>
                <div
                     class="flex items-center p-4 space-x-4  rounded-lg border border-border/50 shadow-sm flex-col sm:flex-row">
                    <Avatar class="w-12 h-12 border-2"
                            :style="`background-image: url('https://avatar.vercel.sh/${user?.name}.jpg');background-size: cover;`">
                        <AvatarImage :src="user?.pictureUrl || ``" />
                        <AvatarFallback>
                            {{ user?.name?.slice(0, 4).toUpperCase() }}
                        </AvatarFallback>
                    </Avatar>
                    <div class="flex-1">
                        <p class="font-semibold text-foreground">{{ user?.name }}</p>
                        <p class="text-sm text-muted-foreground">{{ user?.email }}</p>
                    </div>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DarkModeToggleSubMenu />
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="goToAccountSettings">
                Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="logout">
                Logout
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>