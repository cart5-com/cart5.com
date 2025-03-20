<script setup lang="ts">
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { currentWebsite } from '@dashboard-spa-vue/stores/WebsiteStore';
import { Globe } from "lucide-vue-next";
import { useSidebar } from "@/components/ui/sidebar"

const { setOpenMobile } = useSidebar()

</script>
<template>
    <Sidebar variant="sidebar"
             collapsible="offcanvas">
        <div class="bg-card min-h-full flex flex-col">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <RouterLink :to="{ name: 'website-home' }"
                                    @click="setOpenMobile(false)">
                            <SidebarMenuButton size="lg"
                                               class="">
                                <div class="flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Globe class="size-8" />
                                </div>
                                <div class="grid flex-1 text-left text-sm leading-tight">
                                    <span class="truncate font-semibold">
                                        {{ currentWebsite?.name }}
                                    </span>
                                    <span class="truncate text-xs">
                                        {{ currentWebsite?.defaultHostname ?? '❌Domain required' }}
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        </RouterLink>

                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Setup</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'website-name' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Name
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'website-domains' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Domains
                                    <span v-if="!currentWebsite?.defaultHostname"
                                          class="text-xs text-muted-foreground">
                                        ❌Domain required
                                    </span>
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'website-team' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Team Members
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'website-restaurants' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Restaurants
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <!-- <div class="flex justify-center items-center gap-4">
                    <DarkModeToggle />
                    <AppChoose />
                </div> -->
            </SidebarFooter>
            <SidebarRail />
        </div>
    </Sidebar>
</template>