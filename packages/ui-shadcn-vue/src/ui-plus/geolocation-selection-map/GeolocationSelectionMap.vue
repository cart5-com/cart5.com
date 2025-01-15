<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import { Map, map, tileLayer } from "leaflet";
import { Loader2, LocateFixed } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { onMounted, ref } from "vue";
import { defineExpose } from "vue";
import { toast } from '@/ui-plus/sonner';

const props = defineProps<{
	address?: string;
}>();

interface HelperBtns {
	label: string;
	lat: number;
	lng: number;
}
const randomId = `map-${Math.random().toString(36).substring(2, 15)}`;
const mapView = ref<Map>();
const helperBtns = ref<HelperBtns[]>([]);

onMounted(() => {
	console.log("onMounted MAP");
	mapView.value = map(randomId);
	mapView.value.attributionControl.setPrefix(false);
	tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
		maxZoom: 22,
		subdomains: ["mt0", "mt1", "mt2", "mt3"],
		attribution:
			"<a href='https://www.google.com/maps' target='_blank'>Google Maps</a> | <a href='https://leafletjs.com/' target='_blank'>Leaflet</a>"
	}).addTo(mapView.value);
	// tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	// 	attribution: "Leaflet | OpenStreetMap contributors",
	// 	maxZoom: 18,
	// 	subdomains: ["a", "b", "c"]
	// }).addTo(mapView.value);
	// mapView.value.fitWorld();
});

function setCenter(lat: number, lng: number) {
	mapView.value?.setView([Number(lat), Number(lng)], 18);
}

const isGpsLoading = ref(false);
async function handleGpsClick() {
	isGpsLoading.value = true;
	await new Promise((resolve) => setTimeout(resolve, 500));
	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				isGpsLoading.value = false;
				mapView.value?.setView([position.coords.latitude, position.coords.longitude], 18);
				toast.success("Your location has been set.");
			},
			(error) => {
				console.log("error", error);
				toast.error("Geolocation error: please try again");
				isGpsLoading.value = false;
			}
		);
	} else {
		toast.error("Geolocation is not supported by your web browser.");
		isGpsLoading.value = false;
	}
}

defineExpose({
	mapView,
	helperBtns
});
</script>

<template>
	<div class="h-full">
		<div class="flex h-full flex-col">
			<p class="address-value border p-1 text-sm font-extrabold shrink-0">
				{{ props.address || "" }}
			</p>

			<div :id="randomId"
				 class="relative flex-1 min-h-0">
				<div id="map-marker"></div>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger as-child>
							<Button type="button"
									variant="outline"
									:disabled="isGpsLoading"
									class="rubberBand-animation absolute right-1 top-1 z-[1001]"
									@click="handleGpsClick">
								<Loader2 v-if="isGpsLoading"
										 class="animate-spin" />
								<LocateFixed v-else
											 class="" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="left">
							<p>Find Your Location</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>



			<div
				 class="headShake-animation helper-btns my-2 max-w-full overflow-x-auto overflow-y-hidden whitespace-nowrap shrink-0">
				<Button :title="helperBtn.label"
						v-for="(helperBtn, index) in helperBtns"
						:key="index"
						variant="outline"
						class="m-1 inline-block max-w-[200px] truncate"
						@click="setCenter(helperBtn.lat, helperBtn.lng)">
					{{ helperBtn.label }}
				</Button>
			</div>
		</div>
	</div>
</template>

<style scoped>
#map-marker {
	position: absolute;
	top: 50%;
	left: 50%;
	width: 20px;
	height: 20px;
	background-color: red;
	border-radius: 50%;
	transform: translate(-46%, -16%);
	/*/
		transform: translate(-50%, -50%);
		/*/
	z-index: 1001;
	pointer-events: none;
}

#map-marker::after {
	content: "";
	position: absolute;
	bottom: -10px;
	left: 50%;
	border-left: 7px solid transparent;
	border-right: 7px solid transparent;
	border-top: 13px solid red;
	transform: translateX(-50%);
}

#gps-btn-container {
	position: absolute;
	top: 10px;
	right: 10px;
	z-index: 1001;
}

.headShake-animation {
	animation: headShake 0.5s;
}

@keyframes headShake {
	0% {
		transform: translateX(0);
	}

	25% {
		transform: translateX(-6px) rotateY(-6deg);
	}

	50% {
		transform: translateX(5px) rotateY(6deg);
	}

	75% {
		transform: translateX(-3px) rotateY(-3deg);
	}

	100% {
		transform: translateX(0);
	}
}

.rubberBand-animation {
	animation: rubberBand 1.5s ease-in-out;
}

@keyframes rubberBand {
	0% {
		transform: scale(1);
	}

	30% {
		transform: scale(1.25);
	}

	40% {
		transform: scale(0.75);
	}

	50% {
		transform: scale(1.15);
	}

	60% {
		transform: scale(0.95);
	}

	70% {
		transform: scale(1.05);
	}

	100% {
		transform: scale(1);
	}
}
</style>
