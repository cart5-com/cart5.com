import { ref } from 'vue'
import { type ResType } from 'lib/hono/apiClients/ecomApiClient'
import { dashboardApiClient } from '@src/lib/dashboardApiClient';


export const myTeams = ref<ResType<
    typeof dashboardApiClient.api_dashboard.team.my_teams.$get
>["data"]>([])

export async function loadMyTeams() {
    const response = await (await dashboardApiClient.api_dashboard.team.my_teams.$get()).json()
    myTeams.value = response.data

    console.log(myTeams.value)
}

loadMyTeams();