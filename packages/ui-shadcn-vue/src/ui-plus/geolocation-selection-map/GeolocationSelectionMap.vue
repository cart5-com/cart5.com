<script setup lang="ts">
// TODO: remove leaflet imports, use CDN like LeafletEditor.vue
import "leaflet/dist/leaflet.css";
import { Map, map, tileLayer } from "leaflet";
import { Loader2, LocateFixed } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { onMounted, ref } from "vue";
import { defineExpose } from "vue";
import { toast } from '@/ui-plus/sonner';

interface HelperBtns {
	label: string;
	lat: number;
	lng: number;
}
const randomId = `map-${Math.random().toString(36).substring(2, 15)}`;
const mapView = ref<Map>();
const helperBtns = ref<HelperBtns[]>([]);
const address = ref<string>('');

onMounted(() => {
	console.log("onMounted MAP");
	mapView.value = map(randomId);
	mapView.value.attributionControl.setPrefix(false);
	tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 18,
		subdomains: ["a", "b", "c"]
	}).addTo(mapView.value);
	// or we can use google maps tiles, but I am not sure about TOS
	// tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
	// 	maxZoom: 22,
	// 	subdomains: ["mt0", "mt1", "mt2", "mt3"],
	// 	attribution:
	// 		"<a href='https://www.google.com/maps' target='_blank'>Google Maps</a> | <a href='https://leafletjs.com/' target='_blank'>Leaflet</a>"
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

				// Check if Current Location already exists in helperBtns
				const currentLocationExists = helperBtns.value.some(btn => btn.label === "Current Location");
				if (currentLocationExists) {
					// Update existing Current Location coordinates
					helperBtns.value = helperBtns.value.map(btn => {
						if (btn.label === "Current Location") {
							return {
								...btn,
								lat: position.coords.latitude,
								lng: position.coords.longitude
							};
						}
						return btn;
					});
				} else {
					// Add new Current Location to start of array
					helperBtns.value = [{
						label: "Current Location",
						lat: position.coords.latitude,
						lng: position.coords.longitude
					}, ...helperBtns.value];
				}

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
	helperBtns,
	address
});
</script>

<template>
	<div class="h-full">
		<div class="flex h-full flex-col">
			<p class="address-value border p-1 text-sm font-extrabold shrink-0">
				{{ address || "" }}
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
</style>
