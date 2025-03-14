import { ref, computed } from 'vue'
import { type ResType } from 'lib/hono/apiClients/ecomApiClient'
import { dashboardApiClient } from '@src/lib/dashboardApiClient';

export type websiteListType = ResType<
    typeof dashboardApiClient.api_dashboard.website.my_websites.$get
>["data"];

// Define a more specific type for website data
export interface Website {
    id: string;
    name: string;
    defaultHostname: string | null;
}

export const myWebsites = ref<Website[]>([]);
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

export let currentDashboard = ref<Website | null>(null);

export async function loadMyWebsites() {
    console.log('loadMyWebsites');
    const response = await (await dashboardApiClient.api_dashboard.website.my_websites.$get()).json()
    if (response.error) {
        console.error(response.error)
        return
    } else {
        myWebsites.value = response.data as Website[];
        currentDashboard.value = myWebsites.value.find(website => website.defaultHostname === window.location.host) ?? null;
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