import { ref } from "vue";
import { type MenuJSON } from "lib/types/menuTypes";
import { dashboardApiClient } from "@src/lib/dashboardApiClient";
import { currentRestaurantId } from "@src/stores/RestaurantStore";
import { toast } from '@/ui-plus/sonner';

export const defaultMenuJSON: MenuJSON = {
    categoryIdsOrder: [],
    allCategories: {},
    allItems: {},
    allOptionGroups: {}
}

export const menuJSON = ref<MenuJSON>(defaultMenuJSON);

export const isLoading = ref(false);

export const loadMenu = async () => {
    isLoading.value = true;
    try {
        // const { data, error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$post({
        //     param: {
        //         restaurantId: currentRestaurantId.value ?? '',
        //     },
        //     json: {
        //         columns: {
        //             menu: {
        //                 menuJson: true
        //             }
        //         }
        //     }
        // })).json();

        // if (error) {
        //     toast.error('Failed to load menu');
        //     return;
        // }

        // menuJSON.value = data?.menu?.menuJson as MenuJSON || defaultMenuJSON;
        menuJSON.value = defaultMenuJSON;
    } catch (err) {
        console.error('Error loading menu:', err);
        toast.error('Failed to load menu');
    } finally {
        isLoading.value = false;
    }
}

export const saveMenu = async () => {
    isLoading.value = true;
    try {
        // const { error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$patch({
        //     param: {
        //         restaurantId: currentRestaurantId.value ?? '',
        //     },
        //     json: {
        //         menu: {
        //             menuJson: menuJSON.value
        //         }
        //     }
        // })).json();

        // if (error) {
        //     toast.error('Failed to save menu');
        //     return;
        // }
        toast.warning('Menu save disabled');
    } catch (err) {
        console.error('Error saving menu:', err);
        toast.error('Failed to save menu');
    } finally {
        isLoading.value = false;
    }
}