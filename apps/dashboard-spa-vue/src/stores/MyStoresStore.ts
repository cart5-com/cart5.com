import { ref, computed } from 'vue'
import { type ResType } from '@api-client/typeUtils';
import { dashboardApiClient } from '@api-client/dashboard';

export type storeListType = ResType<
    typeof dashboardApiClient.dashboard.store.my_stores.$get
>["data"];


export const myStores = ref<storeListType>([]);
export const searchQuery = ref('')
export const myStoresFiltered = computed(() =>
    myStores.value.filter(store =>
        store.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        store.address1?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
)

export const currentStoreId = ref<string | null>(null);
export const currentStore = computed(() => {
    if (!currentStoreId.value) return null;
    return myStores.value.find(store => store.id === currentStoreId.value);
});

export async function loadMyStores() {
    console.log('loadMyStores');
    const response = await (await dashboardApiClient.dashboard.store.my_stores.$get()).json()
    if (response.error) {
        console.error(response.error)
        return
    } else {
        myStores.value = response.data
    }
}

export function setCurrentStoreId(storeId: string) {
    currentStoreId.value = storeId
}

export function setCurrentStoreName(name: string) {
    if (!currentStoreId.value) return;
    const store = myStores.value.find(store => store.id === currentStoreId.value);
    if (store) {
        store.name = name;
    }
}

loadMyStores();
