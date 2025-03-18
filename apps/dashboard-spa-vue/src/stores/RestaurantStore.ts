import { ref, computed } from 'vue'
import { type ResType } from '@api-client/index'
import { apiClient } from '@api-client/index';

export type restaurantListType = ResType<
    typeof apiClient.dashboard.restaurant.my_restaurants.$get
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
    const response = await (await apiClient.dashboard.restaurant.my_restaurants.$get()).json()
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

export function setCurrentRestaurantName(name: string) {
    if (!currentRestaurantId.value) return;
    const restaurant = myRestaurants.value.find(restaurant => restaurant.id === currentRestaurantId.value);
    if (restaurant) {
        restaurant.name = name;
    }
}

loadMyRestaurants();
