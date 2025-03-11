import { ref, computed } from 'vue'
import { type ResType } from 'lib/hono/apiClients/ecomApiClient'
import { dashboardApiClient } from '@src/lib/dashboardApiClient';

export type websiteListType = ResType<
    typeof dashboardApiClient.api_dashboard.website.my_websites.$get
>["data"];

export const myWebsites = ref<websiteListType>([]);
export const searchQuery = ref('')
export const myWebsitesFiltered = computed(() =>
    myWebsites.value.filter(website =>
        website.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
)

export const currentWebsiteId = ref<string | null>(null);

export const currentWebsite = computed(() => {
    if (!currentWebsiteId.value) return null;
    return myWebsites.value.find(website => website.id === currentWebsiteId.value);
});

export async function loadMyWebsites() {
    console.log('loadMyWebsites');
    const response = await (await dashboardApiClient.api_dashboard.website.my_websites.$get()).json()
    if (response.error) {
        console.error(response.error)
        return
    } else {
        myWebsites.value = response.data
    }
}

export function setCurrentWebsiteId(websiteId: string) {
    currentWebsiteId.value = websiteId
}

export function setCurrentWebsiteName(name: string) {
    if (!currentWebsiteId.value) return;
    const website = myWebsites.value.find(website => website.id === currentWebsiteId.value);
    if (website) {
        website.name = name;
    }
}

loadMyWebsites(); 