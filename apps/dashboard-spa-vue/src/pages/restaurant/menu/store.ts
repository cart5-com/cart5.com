import { ref } from "vue";
import { Item, type MenuRoot } from "lib/types/menuType";
import { dashboardApiClient } from "@src/lib/dashboardApiClient";
import { currentRestaurantId } from "@src/stores/RestaurantStore";
import { toast } from "@/ui-plus/sonner";

export const defaultMenuRoot: MenuRoot = {
    children: [],
    allItems: {}
}

export const menuRoot = ref<MenuRoot>(defaultMenuRoot);

export const isMenuLoading = ref(false);

const cleanEmptyProperties = (menuRoot: MenuRoot) => {
    const cleanedMenuRoot = JSON.parse(JSON.stringify(menuRoot));
    for (const itemId in cleanedMenuRoot.allItems) {
        for (const key in cleanedMenuRoot.allItems[itemId]) {
            // if string check length
            if (typeof cleanedMenuRoot.allItems[itemId][key as keyof Item] === 'string') {
                if (cleanedMenuRoot.allItems[itemId][key as keyof Item]?.toString().trim().length === 0) {
                    console.log('deleting', itemId, key);
                    delete cleanedMenuRoot.allItems[itemId][key as keyof Item];
                }
            }
            // if array check length
            if (Array.isArray(cleanedMenuRoot.allItems[itemId][key as keyof Item])) {
                if (cleanedMenuRoot.allItems[itemId][key as keyof Item]?.length === 0) {
                    console.log('deleting', itemId, key);
                    delete cleanedMenuRoot.allItems[itemId][key as keyof Item];
                }
            }
            // if object check length
            if (typeof cleanedMenuRoot.allItems[itemId][key as keyof Item] === 'object') {
                if (Object.keys(cleanedMenuRoot.allItems[itemId][key as keyof Item]).length === 0) {
                    console.log('deleting', itemId, key);
                    delete cleanedMenuRoot.allItems[itemId][key as keyof Item];
                }
            }
        }
    }
    return cleanedMenuRoot;
}

export const loadMenu = async () => {
    isMenuLoading.value = true;
    try {
        const { data, error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$post({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                columns: {
                    menu: {
                        menuRoot: true
                    }
                }
            }
        })).json();

        if (error) {
            toast.error('Failed to load menu');
            return;
        }

        menuRoot.value = data?.menu?.menuRoot as MenuRoot || defaultMenuRoot;
    } catch (err) {
        console.error('Error loading menu:', err);
        toast.error('Failed to load menu');
    } finally {
        isMenuLoading.value = false;
    }
}

export const saveMenu = async () => {
    isMenuLoading.value = true;
    try {
        const { error } = await (await dashboardApiClient.api.dashboard.restaurant[':restaurantId'].$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                menu: {
                    menuRoot: cleanEmptyProperties(menuRoot.value)
                }
            }
        })).json();

        if (error) {
            toast.error('Failed to save menu');
            return;
        }
        toast.success('Menu saved successfully');
    } catch (err) {
        console.error('Error saving menu:', err);
        toast.error('Failed to save menu');
    } finally {
        isMenuLoading.value = false;
    }
}