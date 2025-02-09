import { ref } from "vue";
import { type MenuJSON } from "lib/types/menuTypes-old";
// import { dashboardApiClient } from "@src/lib/dashboardApiClient";
// import { currentRestaurantId } from "@src/stores/RestaurantStore";
import { toast } from '@/ui-plus/sonner';

export const defaultMenuJSON: MenuJSON = {
    "categoryIdsOrder": [
        "cat-1739078602878"
    ],
    "allCategories": {
        "cat-1739078602878": {
            "catId": "cat-1739078602878",
            "categoryLabel": "New Category 1",
            "itemIds": [
                "item-1739078608289"
            ]
        }
    },
    "allItems": {
        "item-1739078608289": {
            "itemId": "item-1739078608289",
            "itemLabel": "hello",
            "price": 1,
            "itemSizes": [
                {
                    "itemSizeId": "size-1739078616290",
                    "itemSizeLabel": "Size 1",
                    "price": 1,
                    "preSelected": false
                },
                {
                    "itemSizeId": "size-1739078695104",
                    "itemSizeLabel": "Size 2",
                    "price": 1,
                    "preSelected": false
                }
            ],
            "optionGroupIds": [
                "option-group-1739078624324"
            ]
        }
    },
    "allOptionGroups": {
        "option-group-1739078624324": {
            "optionGroupId": "option-group-1739078624324",
            "optionGroupLabel": "Choose 1",
            "maxOptions": 1,
            "minOptions": 0,
            "options": [
                {
                    "optionId": "option-1739078634136",
                    "label": "New Option 1",
                    "price": 0
                }
            ]
        }
    }
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