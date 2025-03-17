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
import { currentRestaurant } from '@src/stores/RestaurantStore';
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
                        <RouterLink :to="{ name: 'restaurant-home' }"
                                    @click="setOpenMobile(false)">
                            <SidebarMenuButton size="lg"
                                               class="">
                                <div class="flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Store class="size-8" />
                                </div>
                                <div class="grid flex-1 text-left text-sm leading-tight">
                                    <span class="truncate font-semibold">
                                        {{ currentRestaurant?.name }}
                                    </span>
                                    <span class="truncate text-xs">
                                        {{ currentRestaurant?.address1 }}
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
                            <RouterLink :to="{ name: 'restaurant-name' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Name & Phone
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'restaurant-address' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Address
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'restaurant-cuisine' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Cuisine
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'restaurant-pickup' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Pickup Options
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'restaurant-delivery-options' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Delivery Options
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'restaurant-on-premise' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    On Premise
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'restaurant-table-reservation-settings' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Table Reservation
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'restaurant-open-hours' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Open Hours
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'restaurant-scheduled-orders' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Scheduled Orders
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'restaurant-tax-settings' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Tax Settings
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'restaurant-payment-methods' }"
                                        @click="setOpenMobile(false)">
                                <SidebarMenuButton>
                                    Payment Methods
                                </SidebarMenuButton>
                            </RouterLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <RouterLink :to="{ name: 'restaurant-menu-editor' }"
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
                <div class="flex justify-center items-center gap-4">
                    <DarkModeToggle />
                    <AppChoose />
                </div>
            </SidebarFooter>
            <SidebarRail />
        </div>
    </Sidebar>
</template>