import { ref, computed } from 'vue'
import { type ResType } from 'lib/apiClients/ecomApiClient'
import { dashboardApiClient } from '@src/lib/dashboardApiClient';

export type restaurantListType = ResType<
    typeof dashboardApiClient["api"]["dashboard"]["restaurant"]["my-restaurants"]["$get"]
>["data"];

export const myRestaurants = ref<restaurantListType>([]);
export const searchQuery = ref('')
export const myRestaurantsFiltered = computed(() =>
    myRestaurants.value.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
)

export const currentRestaurantId = ref<string | null>(null);

export const currentRestaurant = computed(() => {
    if (!currentRestaurantId.value) return null;
    return myRestaurants.value.find(restaurant => restaurant.id === currentRestaurantId.value);
});

export async function loadMyRestaurants() {
    console.log('loadMyRestaurants');
    const response = await (await dashboardApiClient.api.dashboard.restaurant["my-restaurants"].$get()).json()
    if (response.error) {
        console.error(response.error)
        return
    } else {
        myRestaurants.value = response.data
    }
}

export function setCurrentRestaurantId(restaurantId: string) {
    currentRestaurantId.value = restaurantId
}

loadMyRestaurants();