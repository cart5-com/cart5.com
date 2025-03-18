<script setup lang="ts">
import { onMounted } from 'vue'
import type { DeliveryZone, Point } from '@lib/types/restaurantTypes'
import { type DrawMap } from 'leaflet';
import { toast } from '@/ui-plus/sonner';

const props = defineProps<{
    deliveryZones: DeliveryZone[]
    restaurantLocation: Point
    selectedZone: DeliveryZone | null
}>()

const defaultShapeOptions: L.PathOptions = {
    color: '#000000',
    opacity: 1,
    fillOpacity: 0.1,
    fillColor: '#000000',
    weight: 1,
}

const selectedZoneOptions: L.PathOptions = {
    color: 'red',
    opacity: 1,
    fillOpacity: 0.3,
    fillColor: '#ff0000',
    fill: true,
    weight: 1,
}

// Add expose for getCurrentShape
defineExpose({
    getCurrentShape
});

function getCurrentShape() {
    return currentShapeRef;
}

const mapId = `lmap-${Math.random().toString(36).substring(2, 15)}`
let mapInstance: DrawMap | null = null
let drawnItem: L.FeatureGroup | null = null
let drawControl: L.Control.Draw | null = null
let editControl: L.Control.Draw | null = null
let currentShapeRef: L.Layer | undefined;

function createShape(
    zone: DeliveryZone,
    shapeOptions: L.PolylineOptions | L.CircleMarkerOptions,
    bounds: L.LatLngBounds
) {
    if (zone.shapeType === 'polygon') {
        const polygon = window.L.polygon(zone.polygonArea as L.LatLngExpression[], shapeOptions);
        // zone.polygonArea?.forEach(point => bounds.extend([point.lat ?? 0, point.lng ?? 0]));
        setTimeout(() => {
            bounds.extend(polygon.getBounds());
        }, 100)
        return polygon;
    } else if (zone.shapeType === 'circle') {
        if (zone && zone.circleArea &&
            zone.circleArea.center &&
            zone.circleArea.center.lat &&
            zone.circleArea.center.lng &&
            zone.circleArea.radius
        ) {
            const circle = window.L.circle([zone.circleArea.center.lat, zone.circleArea.center.lng], {
                radius: zone.circleArea.radius,
                ...shapeOptions,
            })
            // bounds.extend([
            //     zone.circleArea.center.lat, zone.circleArea.center.lng
            // ]);
            // bounds.extend([
            //     zone.circleArea.center.lat + zone.circleArea.radius / 111000, // Convert meters to degrees
            //     zone.circleArea.center.lng
            // ]);
            // bounds.extend([
            //     zone.circleArea.center.lat - zone.circleArea.radius / 111000, // Convert meters to degrees
            //     zone.circleArea.center.lng
            // ]);
            setTimeout(() => {
                bounds.extend(circle.getBounds());
            }, 100)
            return circle;
        }
    } else if (zone.shapeType === 'rectangle') {
        if (
            zone.rectangleArea &&
            zone.rectangleArea.topLeft &&
            zone.rectangleArea.topLeft.lat &&
            zone.rectangleArea.topLeft.lng &&
            zone.rectangleArea.bottomRight &&
            zone.rectangleArea.bottomRight.lat &&
            zone.rectangleArea.bottomRight.lng
        ) {
            const rectangle = window.L.rectangle([
                [zone.rectangleArea.topLeft.lat,
                zone.rectangleArea.topLeft.lng],
                [zone.rectangleArea.bottomRight.lat,
                zone.rectangleArea.bottomRight.lng]
            ], shapeOptions)
            // bounds.extend([
            //     zone.rectangleArea.topLeft.lat, zone.rectangleArea.topLeft.lng
            // ]);
            // bounds.extend([
            //     zone.rectangleArea.bottomRight.lat, zone.rectangleArea.bottomRight.lng
            // ]);
            setTimeout(() => {
                bounds.extend(rectangle.getBounds());
            }, 100)
            return rectangle;
        }
    }
}

function createNewCircle(bounds: L.LatLngBounds) {
    // Clear any existing shape
    if (currentShapeRef) {
        drawnItem?.removeLayer(currentShapeRef);
        currentShapeRef = undefined;
    }

    // Calculate maximum radius from existing delivery zones
    let maxRadius = 500; // default fallback
    props.deliveryZones.forEach(zone => {
        if (zone.shapeType === 'circle' && zone.circleArea?.radius) {
            maxRadius = Math.max(maxRadius, zone.circleArea.radius);
        } else if (zone.shapeType === 'polygon' && zone.polygonArea) {
            // For polygons, calculate distance to furthest point
            zone.polygonArea.forEach(point => {
                const distance = window.L.latLng(props.restaurantLocation.lat ?? 0, props.restaurantLocation.lng ?? 0).distanceTo([point.lat ?? 0, point.lng ?? 0]);
                maxRadius = Math.max(maxRadius, distance);
            });
        } else if (zone.shapeType === 'rectangle' && zone.rectangleArea) {
            // For rectangles, calculate distance to corners
            const corners = [
                [zone.rectangleArea.topLeft?.lat ?? 0, zone.rectangleArea.topLeft?.lng ?? 0],
                [zone.rectangleArea.topLeft?.lat ?? 0, zone.rectangleArea.bottomRight?.lng ?? 0],
                [zone.rectangleArea.bottomRight?.lat ?? 0, zone.rectangleArea.topLeft?.lng ?? 0],
                [zone.rectangleArea.bottomRight?.lat ?? 0, zone.rectangleArea.bottomRight?.lng ?? 0]
            ];
            corners.forEach(corner => {
                const distance = window.L.latLng(props.restaurantLocation.lat ?? 0, props.restaurantLocation.lng ?? 0).distanceTo(
                    [
                        corner[0] ?? 0,
                        corner[1] ?? 0]
                );
                maxRadius = Math.max(maxRadius, distance);
            });
        }
    });

    // Add 20% to the maximum radius found
    maxRadius = maxRadius * 1.2;

    // Create default circle at restaurant location with calculated radius
    const circle = window.L.circle([props.restaurantLocation.lat ?? 0, props.restaurantLocation.lng ?? 0], {
        radius: maxRadius,
        ...selectedZoneOptions
    });

    currentShapeRef = circle;
    drawnItem?.addLayer(circle);
    showEditControl();
    toast.info('Resize the circle to define your delivery area');

    setTimeout(() => {
        bounds.extend(circle.getBounds());
    }, 100)

    if (bounds.isValid()) {
        setTimeout(() => {
            mapInstance?.fitBounds(bounds);
        }, 200)
    }
}

let isLeafletInitialized = false;

const initMap = async () => {

    setTimeout(() => {
        if (isLeafletInitialized === false) {
            toast.error('Map failed! please refresh the page');
        }
    }, 3e3);

    while (!window.L || !window.L.drawVersion) {
        await new Promise(resolve => setTimeout(resolve, 500))
    }
    isLeafletInitialized = true;
    mapInstance = window.L.map(mapId, {
        // @ts-ignore
        fullscreenControl: true,
        // fullscreenControlOptions: {
        //     position: 'topleft'
        // }
    }).setView([props.restaurantLocation.lat ?? 0, props.restaurantLocation.lng ?? 0], 13)

    window.L.marker([props.restaurantLocation.lat ?? 0, props.restaurantLocation.lng ?? 0]).addTo(mapInstance)
        .bindPopup('Business Location')

    mapInstance.attributionControl.setPrefix(false);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        subdomains: ["a", "b", "c"]
    }).addTo(mapInstance);

    drawnItem = new window.L.FeatureGroup();

    mapInstance.addLayer(drawnItem);

    drawControl = new window.L.Control.Draw({
        draw: {
            polyline: false,
            marker: false,
            circlemarker: false,
        },
        position: 'topright',
    });
    editControl = new window.L.Control.Draw({
        draw: {
            polyline: false,
            marker: false,
            circlemarker: false,
            polygon: false,
            rectangle: false,
            circle: false,
        },
        edit: {
            featureGroup: drawnItem,
            remove: false,
            edit: false,
        },
        position: 'topright',
    });

    // Add event handlers for draw events
    mapInstance.on(window.L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer;
        currentShapeRef = layer;
        drawnItem?.addLayer(layer);
        showEditControl();
    });

    mapInstance.on(window.L.Draw.Event.DELETED, () => {
        if (editControl) {
            editControl.remove();
        }
        if (drawControl) {
            mapInstance?.addControl(drawControl);
        }
    });


    const bounds = window.L.latLngBounds([
        [props.restaurantLocation.lat ?? 0, props.restaurantLocation.lng ?? 0],
    ]);

    mapInstance.on(window.L.Draw.Event.DRAWSTART, (e: any) => {
        if (e.layerType === 'circle') {
            createNewCircle(bounds);
        }
    })

    props.deliveryZones
        .filter(zone => zone.id !== props.selectedZone?.id)
        .forEach(zone => {
            const shape = createShape(zone, defaultShapeOptions, bounds);
            if (shape && mapInstance) {
                shape.addTo(mapInstance)
            }
        })

    if (props.selectedZone) {
        currentShapeRef = createShape(props.selectedZone, {
            ...selectedZoneOptions
        }, bounds);
        if (currentShapeRef && drawnItem) {
            drawnItem.addLayer(currentShapeRef);
            showEditControl();
        }
    } else {
        showDrawControl();
    }

    if (bounds.isValid()) {
        setTimeout(() => {
            mapInstance?.fitBounds(bounds);
        }, 200)
    }
}

function showEditControl() {
    if (drawControl) {
        drawControl.remove();
    }
    if (editControl) {
        mapInstance?.addControl(editControl);
        setTimeout(() => {
            new window.L.EditToolbar.Edit(mapInstance!, { featureGroup: drawnItem! }).enable();
        }, 100)
    }
    // Add clear control when in edit mode
    if (!clearControl && mapInstance) {
        clearControl = createClearControl();
        mapInstance.addControl(clearControl);
    }
}

function showDrawControl() {
    if (drawControl) {
        drawControl.remove();
        mapInstance?.addControl(drawControl);
    }
    if (editControl) {
        editControl.remove();
    }
    // Remove clear control when in draw mode
    if (clearControl && mapInstance) {
        clearControl.remove();
        clearControl = null;
    }
}

onMounted(async () => {
    const script = document.querySelector('#leaflet-script')
    if (!script) {
        const css = document.createElement('link');
        css.href = `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`
        css.rel = 'stylesheet'
        document.head.appendChild(css)

        const script = document.createElement('script')
        script.src = `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`
        script.id = 'leaflet-script'
        document.head.appendChild(script)


        const drawCss = document.createElement('link');
        drawCss.href = `https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css`
        drawCss.rel = 'stylesheet'
        document.head.appendChild(drawCss)

        while (!window.L) {
            await new Promise(resolve => setTimeout(resolve, 500))
        }
        const fullScreenCss = document.createElement('link');
        fullScreenCss.href = `https://cdnjs.cloudflare.com/ajax/libs/leaflet.fullscreen/3.0.2/Control.FullScreen.css`
        fullScreenCss.rel = 'stylesheet'
        document.head.appendChild(fullScreenCss)

        const fullScreenScript = document.createElement('script')
        fullScreenScript.src = `https://cdnjs.cloudflare.com/ajax/libs/leaflet.fullscreen/3.0.2/Control.FullScreen.min.js`
        document.head.appendChild(fullScreenScript)

        const drawScript = document.createElement('script')
        drawScript.src = `https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js`
        document.head.appendChild(drawScript)
        while (!window.L.drawVersion) {
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        window.L.drawLocal.edit.handlers.edit.tooltip.text = 'Drag handles 🔲 to edit/resize active shape';
        window.L.drawLocal.edit.handlers.edit.tooltip.subtext = 'Click done to save changes or close to discard';
    }
    initMap()
})

let clearControl: L.Control | null = null;  // Add this line


// Add this function
function createClearControl() {
    const CustomControl = window.L.Control.extend({
        options: {
            position: 'topright'
        },

        onAdd: function () {
            const container = window.L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            const button = window.L.DomUtil.create('a', '', container);
            button.innerHTML = 'Remove';
            button.href = '#';
            button.style.width = '50px';
            // button.style.height = '30px';
            button.style.lineHeight = '30px';
            button.style.backgroundColor = 'white';
            button.style.textAlign = 'center';
            button.style.textDecoration = 'none';
            button.style.color = '#666';
            button.style.fontWeight = 'bold';

            window.L.DomEvent.on(button, 'click', function (e) {
                window.L.DomEvent.preventDefault(e);
                clearShape();
            });

            return container;
        }
    });

    return new CustomControl();
}

// Add this function
function clearShape() {
    if (currentShapeRef && drawnItem) {
        drawnItem.removeLayer(currentShapeRef);
        currentShapeRef = undefined;

        // Show draw control and hide edit control
        showDrawControl();

        // Hide clear button
        if (clearControl && mapInstance) {
            clearControl.remove();
        }
    }
}

</script>

<template>
    <div class="w-full h-full">
        <div :id="mapId"
             class="flex-1 w-full h-full">
        </div>
    </div>
</template>

<style>
.leaflet-control-container>.leaflet-left {
    transform: scale(1.5) translateY(20%);
}

.leaflet-control-container>.leaflet-top.leaflet-right {
    transform: scale(1.5) translateY(20%);
}
</style>
