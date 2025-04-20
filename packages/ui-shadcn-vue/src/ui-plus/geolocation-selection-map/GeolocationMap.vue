<script setup lang="ts">
import type { HelperBtns } from "./types";
import { loadLeafletCDN } from "./loadLeafletCDN";
import { Loader2, LocateFixed, MapPinCheckInside } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { onMounted, onUnmounted, ref } from "vue";
import { toast } from '@/ui-plus/sonner';
import { geocode } from "./geocode";
import { searchOpenStreetMap } from "./searchOpenStreetMap";
import { ipwhois } from "@/ui-plus/geolocation-selection-map/ipwhois";
import { calculateDistance } from "@lib/utils/calculateDistance";

const props = defineProps<{
	address: string;
	country: string;
	lat?: number;
	lng?: number;
	btnLabel?: string;
}>();

const randomId = `map-${Math.random().toString(36).substring(2, 15)}`;
const helperBtns = ref<HelperBtns[]>([]);
let mapView: L.Map | null = null;
let marker: L.Marker | null = null;

const mapMoveListener = () => {
	marker?.setLatLng([mapView?.getCenter().lat ?? 0, mapView?.getCenter().lng ?? 0])
}

onUnmounted(() => {
	mapView?.off('move', mapMoveListener)
	mapView?.off('resize', mapMoveListener)
})

function setCenter(lat: number, lng: number) {
	mapView?.setView([Number(lat), Number(lng)]);
	marker?.setLatLng([lat, lng])
}

onMounted(async () => {
	const loaded = await loadLeafletCDN();
	if (!loaded) {
		return;
	}

	mapView = window.L.map(randomId);
	marker = window.L.marker([0, 0]).addTo(mapView)
	marker.setOpacity(0.8)
	mapView?.on('move', mapMoveListener)
	mapView?.on('resize', mapMoveListener)
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
	mapView.setZoom(18);
	loadHelperBtns();
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
						lng: position.coords.longitude,
						type: 'GPS'
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


async function loadHelperBtns() {
	const gecodeResult = await geocode(props.address, props.country?.toLowerCase())
	const openStreetMapItems = await searchOpenStreetMap(props.address, props.country?.toLowerCase())
	const ipwho = await ipwhois()
	helperBtns.value = [
		...gecodeResult.data.results.map(item => ({
			label: item.formatted_address || props.address,
			lat: item.geometry.location.lat,
			lng: item.geometry.location.lng,
			type: 'geocode' as const
		})),
		...openStreetMapItems.map(item => ({
			label: item.label,
			lat: item.lat,
			lng: item.lng,
			type: 'openstreetmap' as const
		})),
	]
	if (helperBtns.value.length === 0) {
		if (ipwho.postal || ipwho.city || ipwho.country || ipwho.region || ipwho.ip) {
			helperBtns.value.push({
				label: ipwho.postal || ipwho.city || ipwho.country || ipwho.region || ipwho.ip,
				lat: ipwho.latitude ?? 0,
				lng: ipwho.longitude ?? 0,
				type: 'ipwhois' as const
			})
		}
		handleGpsClick()
	}
	if (props.lat && props.lng) {
		// remember last location
		setCenter(props.lat, props.lng)
		// but if the distance is greater than 0.3 km use geocode
		if (helperBtns.value[0].lat && helperBtns.value[0].lng) {
			const distance = calculateDistance({ lat: props.lat, lng: props.lng }, { lat: helperBtns.value[0].lat, lng: helperBtns.value[0].lng })
			if (distance > 0.3) {
				setCenter(helperBtns.value[0].lat!, helperBtns.value[0].lng!)
			}
		}
	} else if (helperBtns.value[0].lat && helperBtns.value[0].lng) {
		setCenter(helperBtns.value[0].lat, helperBtns.value[0].lng)
	}
}

</script>
<template>
	<div class="h-full">
		<div class="flex h-full flex-col">
			<p class="address-value border p-1 text-sm font-extrabold shrink-0">
				{{ props.address || "" }}
			</p>

			<div :id="randomId"
				 class="relative flex-1 min-h-0">
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

				<TooltipProvider v-for="(helperBtn, index) in helperBtns"
								 :key="index">
					<Tooltip>
						<TooltipTrigger as-child>
							<Button variant="outline"
									class="m-1 inline-block max-w-[200px] truncate"
									@click="setCenter(helperBtn.lat ?? 0, helperBtn.lng ?? 0)">
								{{ helperBtn.label }}
							</Button>
						</TooltipTrigger>
						<TooltipContent side="top"
										class="max-w-[200px] max-h-[200px] overflow-auto">
							<p>{{ helperBtn.type }}: {{ helperBtn.label }}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			<div>
				<Button type="button"
						@click="$emit('done', { lat: mapView?.getCenter().lat ?? 0, lng: mapView?.getCenter().lng ?? 0 })"
						class="w-full">
					<MapPinCheckInside />
					{{ btnLabel || "Confirm" }}
				</Button>
			</div>
		</div>
	</div>
</template>

<style scoped>
#gps-btn-container {
	position: absolute;
	top: 10px;
	right: 10px;
	z-index: 1001;
}
</style>
