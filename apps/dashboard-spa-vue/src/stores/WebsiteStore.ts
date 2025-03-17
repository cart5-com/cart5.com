import { ref, computed } from 'vue'
import { type ResType } from '@api-client/ecomApiClient'
import { dashboardApiClient } from '@src/lib/dashboardApiClient';
import { toast } from '@/ui-plus/sonner';

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
        const allWebsites = response.data as Website[];
        const currentOne = allWebsites.find(website => website.defaultHostname === window.location.host) ?? null;
        if (!currentOne) {
            toast.error('no website found for this domain, redirecting..')
            // setTimeout(() => {
            //     if (allWebsites[0] && allWebsites[0].defaultHostname) {
            //         window.location.href = window.location.href.replace(window.location.host, allWebsites[0].defaultHostname);
            //     } else {
            //         window.location.href = window.location.href.replace(window.location.host, `www.${import.meta.env.VITE_PUBLIC_DOMAIN_NAME}`);
            //     }
            // }, 1500)
            return
        } else {
            currentDashboard.value = currentOne;
            myWebsites.value = allWebsites;
        }
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