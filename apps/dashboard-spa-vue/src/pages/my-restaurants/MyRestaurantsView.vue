<script lang="ts" setup>
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-vue-next";
import { myRestaurantsFiltered, myRestaurants, searchQuery, restaurantListType } from '@src/stores/RestaurantStore'
import HeaderOnly from '@src/layouts/HeaderOnly.vue';
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import RestaurantNewForm from "@src/pages/my-restaurants/RestaurantNewForm.vue";
const dialog = useDialog();
const IS_DEV = import.meta.env.DEV;

const openNewRestaurantDialog = () => {
    dialog.show<restaurantListType[number]>({
        title: "Add New Restaurant",
        closeable: false,
        component: RestaurantNewForm,
        onSuccess: async (values) => {
            console.log("success");
            console.log(values);
        },
        onError: async (error: any) => {
            console.log("error");
            console.log(error);
        }
    });
}

</script>

<template>
    <HeaderOnly>
        <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-col gap-1">
                <h3 class="text-2xl font-bold tracking-tight">My Restaurants</h3>
                <!-- <p class="text-muted-foreground text-sm">As a manager, you can view and manage all your restaurants
                    below.</p> -->
            </div>
            <Button class="w-full sm:w-auto"
                    @click="openNewRestaurantDialog">
                <PlusCircleIcon class="mr-2 h-5 w-5" />
                Add New Restaurant
            </Button>
        </div>
        <div class="mb-4"
             v-if="myRestaurants.length > 3 || IS_DEV">
            <Input v-model="searchQuery"
                   placeholder="Search"
                   class="max-w-sm" />
        </div>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <RouterLink v-for="restaurant in myRestaurantsFiltered"
                        :key="restaurant.id"
                        :to="`/restaurant/${restaurant.id}`"
                        class="block">
                <Card class="bg-muted hover:bg-muted/20 h-24 transition-colors">
                    <CardHeader>
                        <CardTitle class="text-lg"> {{ restaurant.name }}</CardTitle>
                    </CardHeader>
                </Card>
            </RouterLink>
        </div>
    </HeaderOnly>
</template>
