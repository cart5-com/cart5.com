import { ref, computed } from 'vue'
import { type ResType } from '@api-client/typeUtils';
import { ordersApiClient } from '@api-client/orders';
import { MySettingsStore } from '@orders-spa-vue/stores/MySettingsStore';
import { listenStoreNotifier } from '@orders-spa-vue/utils/listenStoreNotifier';

export type storeListType = ResType<
    typeof ordersApiClient.my_order_stores.$get
>["data"];

export const myStores = ref<storeListType>([]);
export const isMyStoresLoading = ref(true);

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
    isMyStoresLoading.value = true;
    const response = await (await ordersApiClient.my_order_stores.$get()).json()
    if (response.error) {
        console.error(response.error)
        return
    } else {
        myStores.value = response.data.sort((
            a,
            // _b
        ) => {
            return MySettingsStore.value[a.id]?.isEnabled ? -1 : 1;
        });
        for (const store of myStores.value) {
            if (MySettingsStore.value[store.id]?.isEnabled) {
                listenStoreNotifier(store.id);
            }
        }
    }
    isMyStoresLoading.value = false;
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
