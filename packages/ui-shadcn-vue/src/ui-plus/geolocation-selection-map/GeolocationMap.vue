<script setup lang="ts">
import type { GeoLocation, HelperBtns } from "./types";
import { useVModel } from "@vueuse/core";
import { loadLeafletCDN } from "./loadLeafletCDN";
import { HelpCircle, Loader2, LocateFixed } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { onMounted, onUnmounted, ref } from "vue";
import { toast } from '@/ui-plus/sonner';
import { geocode } from "./geocode";
import { searchOpenStreetMap } from "./searchOpenStreetMap";
import { ipwhois } from "@/ui-plus/geolocation-selection-map/ipwhois";

const props = defineProps<{
	modelValue: GeoLocation;
}>();
const emit = defineEmits<{
	(e: "update:modelValue", value: GeoLocation): void;
}>();
const model = useVModel(props, "modelValue", emit);

const randomId = `map-${Math.random().toString(36).substring(2, 15)}`;
const helperBtns = ref<HelperBtns[]>([]);
let mapView: L.Map | null = null;
// let marker: L.Marker | null = null;

const mapMoveListener = () => {
	model.value.lat = mapView?.getCenter().lat ?? 0;
	model.value.lng = mapView?.getCenter().lng ?? 0;
	// marker?.setLatLng([model.value.lat, model.value.lng])
}

onUnmounted(() => {
	console.log('unmounted')
	mapView?.off('move', mapMoveListener)
})

onMounted(async () => {
	await loadLeafletCDN();

	mapView = window.L.map(randomId);
	// marker = window.L.marker([model.value.lat, model.value.lng]).addTo(mapView)
	mapView?.on('move', mapMoveListener)
	mapView.attributionControl.setPrefix(false);
	// mapView.addLayer(
	// 	window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	// 		maxZoom: 18,
	// 		subdomains: ["a", "b", "c"],
	// 		attribution:
	// 			"<a href='https://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a> | <a href='https://leafletjs.com/' target='_blank'>Leaflet</a>"
	// 	})
	// );
	mapView.addLayer(
		window.L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
			maxZoom: 22,
			subdomains: ["mt0", "mt1", "mt2", "mt3"],
			attribution:
				"<a href='https://www.google.com/maps' target='_blank'>Google Maps</a> | <a href='https://leafletjs.com/' target='_blank'>Leaflet</a>"
		})
	);
	// mapView.fitWorld();

	if (model.value.lat && model.value.lng) {
		setCenter(model.value.lat, model.value.lng)
	} else if (model.value.address) {
		loadHelperBtns()
	} else {
		handleGpsClick()
	}
});

const isGpsLoading = ref(false);
async function handleGpsClick() {
	isGpsLoading.value = true;
	await new Promise((resolve) => setTimeout(resolve, 500));
	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				isGpsLoading.value = false;
				mapView?.setView([position.coords.latitude, position.coords.longitude], 18);

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

const isHelperLoaded = ref(false);
async function loadHelperBtns() {
	if (!model.value.address) {
		return;
	}
	isHelperLoaded.value = true;
	const [
		geocodeResult,
		openStreetMapItems,
		ipwho
	] = await Promise.all([
		geocode(model.value.address, model.value.country?.toLowerCase()),
		searchOpenStreetMap(model.value.address, model.value.country?.toLowerCase()),
		ipwhois()
	]);
	if (geocodeResult && geocodeResult.data.results.length > 0) {
		setCenter(
			geocodeResult.data.results[0].geometry.location.lat,
			geocodeResult.data.results[0].geometry.location.lng
		);
	} else if (openStreetMapItems.length > 0) {
		setCenter(
			openStreetMapItems[0].lat,
			openStreetMapItems[0].lng
		);
	} else {
		handleGpsClick()
	}
	const newBtns = [
		...(
			geocodeResult &&
				geocodeResult.data.results.length > 0 ?
				geocodeResult.data.results.map(item => ({
					label: item.formatted_address,
					lat: item.geometry.location.lat,
					lng: item.geometry.location.lng
				})) :
				[]
		),
		...openStreetMapItems.map(item => ({
			label: item.label,
			lat: item.lat,
			lng: item.lng
		})),
		...(ipwho.latitude && ipwho.longitude ? [{
			label: ipwho.postal || ipwho.city || ipwho.country || ipwho.region || ipwho.ip,
			lat: ipwho.latitude,
			lng: ipwho.longitude
		}] : [])
	];
	const currentLocationExists = helperBtns.value.some(btn => btn.label === "Current Location");
	if (currentLocationExists) {
		helperBtns.value = [
			...helperBtns.value,
			...newBtns,
		];
	} else {
		helperBtns.value = [
			...newBtns,
		];
	}
}

function setCenter(lat: number, lng: number) {
	mapView?.setView([Number(lat), Number(lng)], 18);
	model.value.lat = lat;
	model.value.lng = lng;
}
</script>

<template>
	<div class="h-full">
		<div class="flex h-full flex-col">
			<p class="address-value border p-1 text-sm font-extrabold shrink-0">
				{{ model.address || "" }}
				({{ model.lat }}, {{ model.lng }})
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

				<TooltipProvider v-if="!isHelperLoaded">
					<Tooltip>
						<TooltipTrigger as-child>
							<Button type="button"
									variant="outline"
									class="rubberBand-animation absolute left-1 bottom-1 z-[1001]"
									@click="loadHelperBtns">
								<HelpCircle />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>Click to show address shortcuts</p>
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
	opacity: 0.8;
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
	bottom: -6px;
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
