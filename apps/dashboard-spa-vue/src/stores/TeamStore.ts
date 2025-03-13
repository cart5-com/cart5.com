import { ref } from 'vue'
import { type ResType } from 'lib/hono/apiClients/ecomApiClient'
import { dashboardApiClient } from '@src/lib/dashboardApiClient';


export const myTeams = ref<ResType<
    typeof dashboardApiClient.api_dashboard.team.my_teams.$get
>["data"]>({
    myTeams: [],
    hostnameTeam: null
})

export async function loadMyTeams() {
    const response = await (await dashboardApiClient.api_dashboard.team.my_teams.$get()).json()
    myTeams.value = response.data
    if (window.location.host !== myTeams.value.hostnameTeam?.defaultHostname) {
        alert('Redirecting to default domain')
        window.location.href = window.location.href.replace(window.location.host, myTeams.value.hostnameTeam?.defaultHostname!)
    }
    console.log(myTeams.value)
}

loadMyTeams();