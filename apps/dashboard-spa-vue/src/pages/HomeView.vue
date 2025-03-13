<script lang="ts" setup>
import HeaderOnly from '@src/layouts/HeaderOnly.vue';
import AppLinks from '@src/components/AppLinks.vue';
import { myTeams } from '@src/stores/TeamStore';

</script>

<template>
	<HeaderOnly>
		<main class="flex flex-1 flex-col gap-4 lg:gap-6 lg:p-6">

			<!-- list of teams -->
			<div class="flex flex-col gap-2">

				<div>
					<div class="p-2 border border-dashed rounded-md">
						{{ myTeams.hostnameTeam }}
					</div>
				</div>

				<div v-for="team in myTeams.myTeams"
					 :key="team.teamId">
					<div class="p-2 border border-dashed rounded-md">
						{{ team.name }}
						({{ team.defaultHostname }})

						<div>{{ team }}</div>

					</div>
				</div>
			</div>


			<div class="flex flex-col gap-1">
				<h3 class="text-2xl font-bold tracking-tight">Dashboard</h3>
				<!-- <p class="text-muted-foreground text-sm">Apps to help you run your business.</p>
				<p class="text-muted-foreground text-sm">Start with a new business or manage existing ones.</p> -->
			</div>
			<div class="rounded-lg border border-dashed shadow-sm">
				<div class="mx-auto sm:max-w-[50%]">
					<AppLinks />
				</div>
			</div>
		</main>
	</HeaderOnly>
</template>
