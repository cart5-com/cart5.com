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
import { currentStore } from '@dashboard-spa-vue/stores/MyStoresStore';
import { Store } from "lucide-vue-next";
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
                        <RouterLink :to="{ name: 'store-home' }"
                                    @click="setOpenMobile(false)">
                            <SidebarMenuButton size="lg"
                                               class="">
                                <div class="flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Store class="size-8" />
                                </div>
                                <div class="grid flex-1 text-left text-sm leading-tight">
                                    <span class="truncate font-semibold">
                                        {{ currentStore?.name }}
                                    </span>
                                    <span class="truncate text-xs">
                                        {{ currentStore?.address1 }}
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
                            <RouterLink :to="{ name: 'store-name' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Name & Phone
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'store-address' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Address
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'store-cuisine' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Cuisine
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'store-team' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Team Members
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'store-pickup' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Pickup Options
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'store-delivery-options' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Delivery Options
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'store-open-hours' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Open Hours
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'store-tax-settings' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Tax Settings
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'store-payment-methods' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Payment Methods
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'store-menu-editor' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Menu Editor
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