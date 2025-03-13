import { ref } from 'vue'
import { type ResType } from 'lib/hono/apiClients/ecomApiClient'
import { dashboardApiClient } from '@src/lib/dashboardApiClient';

export type MyTeamsType = ResType<
    typeof dashboardApiClient.api_dashboard.team.my_teams.$get
>["data"];

export const myTeams = ref<MyTeamsType>({
    myTeams: [],
    currentTeam: null
})

export async function loadMyTeams() {
    const response = await (await dashboardApiClient.api_dashboard.team.my_teams.$get()).json()
    myTeams.value = response.data
    if (window.location.host !== myTeams.value.currentTeam?.defaultHostname) {
        alert('Redirecting to default domain')
        window.location.href = window.location.href.replace(window.location.host, myTeams.value.currentTeam?.defaultHostname!)
    }
    console.log(myTeams.value)
}

loadMyTeams();