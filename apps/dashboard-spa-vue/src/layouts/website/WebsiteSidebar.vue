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
import { currentWebsite } from '@src/stores/WebsiteStore';
import { Store } from "lucide-vue-next";
import DarkModeToggle from '@/ui-plus/DarkModeToggle.vue';
import { useSidebar } from "@/components/ui/sidebar"
import AppChoose from "@src/components/AppChoose.vue";

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
                                    <Store class="size-8" />
                                </div>
                                <div class="grid flex-1 text-left text-sm leading-tight">
                                    <span class="truncate font-semibold">
                                        {{ currentWebsite?.name }}
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
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div class="flex justify-center items-center gap-4">
                    <DarkModeToggle />
                    <AppChoose />
                </div>
            </SidebarFooter>
            <SidebarRail />
        </div>
    </Sidebar>
</template>