<script setup lang="ts">
import type { GeoLocation, HelperBtns } from "./types";
import { useVModel } from "@vueuse/core";
import { loadLeafletCDN } from "./loadLeafletCDN";
import { Loader2, LocateFixed } from "lucide-vue-next";
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
let marker: L.Marker | null = null;

const mapMoveListener = () => {
	model.value.lat = mapView?.getCenter().lat ?? 0;
	model.value.lng = mapView?.getCenter().lng ?? 0;
	marker?.setLatLng([model.value.lat, model.value.lng])
}

onUnmounted(() => {
	console.log('unmounted')
	mapView?.off('move', mapMoveListener)
	mapView?.off('resize', mapMoveListener)
})

function setCenter(lat: number, lng: number) {
	mapView?.setView([Number(lat), Number(lng)]);
	model.value.lat = lat;
	model.value.lng = lng;
	marker?.setLatLng([model.value.lat, model.value.lng])
}

onMounted(async () => {
	const loaded = await loadLeafletCDN();
	if (!loaded) {
		return;
	}

	mapView = window.L.map(randomId);
	marker = window.L.marker([model.value.lat ?? 0, model.value.lng ?? 0]).addTo(mapView)
	marker.setOpacity(0.8)
	mapView?.on('move', mapMoveListener)
	mapView?.on('resize', mapMoveListener)
	mapView.attributionControl.setPrefix(false);
	mapView.setZoom(18);
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
		loadHelperBtns()
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

const addGecodeHelperBtn = async () => {
	if (!model.value.address) {
		return;
	}
	const gecodeResult = await geocode(model.value.address, model.value.country?.toLowerCase())
	// Check if a button with the same address, lat, and lng already exists
	const isAddBeforeCurrentLocation = helperBtns.value.some(btn =>
		btn.label === model.value.address &&
		btn.lat === gecodeResult?.data.results[0]?.geometry.location.lat &&
		btn.lng === gecodeResult?.data.results[0]?.geometry.location.lng
	);
	if (isAddBeforeCurrentLocation) {
		return;
	}
	helperBtns.value = [
		...helperBtns.value,
		{
			label: model.value.address,
			lat: gecodeResult?.data.results[0]?.geometry.location.lat,
			lng: gecodeResult?.data.results[0]?.geometry.location.lng
		}
	];
	return 1;
}

const addOpenStreetMapHelperBtn = async () => {
	if (!model.value.address) {
		return;
	}
	const openStreetMapItems = await searchOpenStreetMap(model.value.address, model.value.country?.toLowerCase())
	if (openStreetMapItems.length === 0) {
		return;
	}
	const isAddBeforeCurrentLocation = helperBtns.value.some(btn =>
		btn.label === model.value.address &&
		btn.lat === openStreetMapItems[0].lat &&
		btn.lng === openStreetMapItems[0].lng
	);
	if (isAddBeforeCurrentLocation) {
		return;
	}
	helperBtns.value = [
		...helperBtns.value,
		{
			label: openStreetMapItems[0].label,
			lat: openStreetMapItems[0].lat,
			lng: openStreetMapItems[0].lng
		}
	];
	return 1;
}

const addIpwhoHelperBtn = async () => {
	const ipwho = await ipwhois()
	const isAddBeforeCurrentLocation = helperBtns.value.some(btn =>
		btn.label === ipwho.postal || ipwho.city || ipwho.country || ipwho.region || ipwho.ip &&
		btn.lat === ipwho.latitude &&
		btn.lng === ipwho.longitude
	);
	if (isAddBeforeCurrentLocation) {
		return;
	}
	helperBtns.value = [
		...helperBtns.value,
		{
			label: ipwho.postal || ipwho.city || ipwho.country || ipwho.region || ipwho.ip,
			lat: ipwho.latitude ?? 0,
			lng: ipwho.longitude ?? 0
		}
	];
	return 1;
}

async function loadHelperBtns() {
	await addGecodeHelperBtn()
	await addOpenStreetMapHelperBtn()
	if (helperBtns.value.length === 0) {
		await addIpwhoHelperBtn()
	}
	// if there is a help and initial lat and lng is not set
	if (!model.value.lat || !model.value.lng && helperBtns.value.length > 0) {
		setCenter(helperBtns.value[0].lat, helperBtns.value[0].lng)
	}
}

</script>

<template>
	<div class="h-full">
		<div class="flex h-full flex-col">
			<p class="address-value border p-1 text-sm font-extrabold shrink-0">
				{{ model.address || "" }}
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
#gps-btn-container {
	position: absolute;
	top: 10px;
	right: 10px;
	z-index: 1001;
}
</style>
