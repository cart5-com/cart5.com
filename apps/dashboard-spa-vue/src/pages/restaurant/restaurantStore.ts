import { atom, computed } from 'nanostores'
import { type ResType } from 'lib/apiClients/ecomApiClient'
import { dashboardApiClient } from '@src/lib/dashboardApiClient';

export type restaurantListType = ResType<
    typeof dashboardApiClient["api"]["dashboard"]["restaurant"]["my-restaurants"]["$get"]
>["data"];

export const $myRestaurants = atom<restaurantListType>([]);
export const $myRestaurantsSearchQuery = atom<string>('');
export const $myRestaurantsFiltered = computed(
    [$myRestaurants, $myRestaurantsSearchQuery],
    (restaurants, searchQuery) => restaurants.filter(
        i => i.name.toLowerCase().includes(
            searchQuery.toLowerCase()
        )
    )
);
export async function loadMyRestaurants() {
    console.log('loadMyRestaurants');
    const response = await (await dashboardApiClient.api.dashboard.restaurant["my-restaurants"].$get()).json()
    if (response.error) {
        console.error(response.error)
        return
    } else {
        $myRestaurants.set(response.data)
    }
}