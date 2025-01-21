<script setup lang="ts">
import { onMounted } from 'vue'
import type { DeliveryZone, Point } from 'lib/types/restaurantTypes'

const props = defineProps<{
    deliveryZones: DeliveryZone[]
    restaurantLocation: Point
    selectedZone: DeliveryZone | null
}>()


const mapId = `gmap-${Math.random().toString(36).substring(2, 15)}`
let mapInstance: google.maps.Map | null = null
let drawingManager: google.maps.drawing.DrawingManager | null = null
let currentShapeRef: google.maps.Polygon | google.maps.Circle | google.maps.Rectangle | null = null;

defineExpose({
    getCurrentShape
});

function getCurrentShape() {
    return currentShapeRef
}

const clearControlDiv = document.createElement('div');
const clearBtn = document.createElement('button');
clearBtn.innerHTML = 'Clear';
clearBtn.style.cssText = `background: none padding-box rgb(255, 255, 255); ` +
    `display: none; border: 0px; margin: 0px; padding: 4px; ` +
    `text-transform: none; appearance: none; position: relative; ` +
    `cursor: pointer; user-select: none; direction: ltr; overflow: hidden; ` +
    `text-align: left; color: rgb(86, 86, 86); font-family: Roboto, Arial, sans-serif; ` +
    `font-size: 11px; border-bottom-right-radius: 2px; border-top-right-radius: 2px; ` +
    `box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px; margin-left: 55px; margin-top: 5px; ` +
    `height: 23px; padding-top: 1px; transform: scale(2) translateY(7px); `;
clearBtn.addEventListener('click', () => {
    clearShape()
})
clearControlDiv.appendChild(clearBtn);

const defaultShapeOptions = {
    clickable: false,
    editable: false,
    draggable: false,
    fillOpacity: 0.1,
    strokeColor: '#000000',
    // fillColor: '',
    strokeWeight: 1,
    zIndex: 100
}

const selectedZoneOptions = {
    editable: true,
    draggable: true,
    fillOpacity: 0.3,
    strokeColor: '#ff0000',
    fillColor: '#ff0000',
    zIndex: 1000
}

function onShapeComplete(event: google.maps.drawing.OverlayCompleteEvent) {
    drawingManager?.setDrawingMode(null);
    drawingManager?.setOptions({
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: []
        }
    })
    clearBtn.style.display = 'block'
    currentShapeRef = event.overlay as google.maps.Polygon | google.maps.Circle | google.maps.Rectangle
}



function createShape(
    zone: DeliveryZone,
    shapeOptions: google.maps.PolygonOptions | google.maps.CircleOptions | google.maps.RectangleOptions,
    bounds: google.maps.LatLngBounds
) {
    if (zone.shapeType === 'polygon') {
        const polygon = new google.maps.Polygon({
            paths: zone.polygonArea,
            map: mapInstance,
            ...shapeOptions,
        });
        polygon.getPath().forEach(point => bounds.extend(point));
        return polygon;
    } else if (zone.shapeType === 'circle') {
        const circle = new google.maps.Circle({
            center: zone.circleArea?.center,
            radius: zone.circleArea?.radius,
            map: mapInstance,
            ...shapeOptions,
        });
        bounds.extend(circle.getCenter()!);
        const radius = circle.getRadius()!;
        bounds.extend(google.maps.geometry.spherical.computeOffset(circle.getCenter()!, radius, 0));
        bounds.extend(google.maps.geometry.spherical.computeOffset(circle.getCenter()!, radius, 180));
        return circle;
    } else if (zone.shapeType === 'rectangle') {
        const rectangle = new google.maps.Rectangle({
            bounds: {
                north: zone.rectangleArea?.topLeft.lat ?? 0,
                south: zone.rectangleArea?.bottomRight.lat ?? 0,
                east: zone.rectangleArea?.bottomRight.lng ?? 0,
                west: zone.rectangleArea?.topLeft.lng ?? 0
            },
            map: mapInstance,
            ...shapeOptions,
        });
        bounds.union(rectangle.getBounds()!);
        return rectangle;
    } else {
        return null
    }
}

const initMap = async () => {
    while (!window.google) {
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    mapInstance = new google.maps.Map(document.getElementById(mapId) as HTMLElement, {
        center: props.restaurantLocation,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false
    })

    // Add restaurant marker
    new google.maps.Marker({
        position: props.restaurantLocation,
        map: mapInstance,
    })

    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: !props.selectedZone ? [
                google.maps.drawing.OverlayType.CIRCLE,
                google.maps.drawing.OverlayType.POLYGON,
                google.maps.drawing.OverlayType.RECTANGLE,
            ] : [],
        },
        polygonOptions: selectedZoneOptions,
        rectangleOptions: selectedZoneOptions,
        circleOptions: selectedZoneOptions
    })
    clearBtn.style.display = props.selectedZone ? 'block' : 'none'
    drawingManager.setMap(mapInstance);

    // Create bounds object to contain all shapes
    const bounds = new google.maps.LatLngBounds();

    // draw all other zones on the map as non-editable, put back and make it gray and boring
    props.deliveryZones
        .filter(zone => zone.id !== props.selectedZone?.id)
        .forEach(zone => {
            createShape(zone, defaultShapeOptions, bounds);
        })

    // draw the selected zone on the map as editable, and make it red
    if (props.selectedZone) {
        currentShapeRef = createShape(props.selectedZone, {
            ...defaultShapeOptions,
            ...selectedZoneOptions
        }, bounds);
    }

    // Extend bounds to include restaurant location
    // bounds.extend(props.restaurantLocation);

    // Fit the map to show all shapes
    if (!bounds.isEmpty()) {
        mapInstance.fitBounds(bounds);
    }

    google.maps.event.addListener(drawingManager, "overlaycomplete", (event: google.maps.drawing.OverlayCompleteEvent) => {
        console.log('overlaycomplete', event);
        onShapeComplete(event);
    })
    google.maps.event.addListener(drawingManager, 'drawingmode_changed', () => {
        console.log('drawingmode_changed', drawingManager?.getDrawingMode());
        onDrawingModeChanged();
    });

    mapInstance.controls[google.maps.ControlPosition.TOP_CENTER].push(clearControlDiv);

}

function onDrawingModeChanged() {
    const mode = drawingManager?.getDrawingMode();
    if (mode === google.maps.drawing.OverlayType.CIRCLE) {
        // Clear any existing shape
        if (currentShapeRef) {
            currentShapeRef.setMap(null);
        }

        // Calculate maximum radius from existing delivery zones
        let maxRadius = 500; // default fallback
        props.deliveryZones.forEach(zone => {
            if (zone.shapeType === 'circle' && zone.circleArea?.radius) {
                maxRadius = Math.max(maxRadius, zone.circleArea.radius);
            } else if (zone.shapeType === 'polygon' && zone.polygonArea) {
                // For polygons, calculate distance to furthest point
                zone.polygonArea.forEach(point => {
                    const distance = google.maps.geometry.spherical.computeDistanceBetween(
                        props.restaurantLocation,
                        point
                    );
                    maxRadius = Math.max(maxRadius, distance);
                });
            } else if (zone.shapeType === 'rectangle' && zone.rectangleArea) {
                // For rectangles, calculate distance to corners
                const corners = [
                    { lat: zone.rectangleArea.topLeft.lat, lng: zone.rectangleArea.topLeft.lng },
                    { lat: zone.rectangleArea.topLeft.lat, lng: zone.rectangleArea.bottomRight.lng },
                    { lat: zone.rectangleArea.bottomRight.lat, lng: zone.rectangleArea.topLeft.lng },
                    { lat: zone.rectangleArea.bottomRight.lat, lng: zone.rectangleArea.bottomRight.lng }
                ];
                corners.forEach(corner => {
                    const distance = google.maps.geometry.spherical.computeDistanceBetween(
                        props.restaurantLocation,
                        corner
                    );
                    maxRadius = Math.max(maxRadius, distance);
                });
            }
        });

        // Add 20% to the maximum radius found
        maxRadius = maxRadius * 1.2;

        // Create default circle at restaurant location with calculated radius
        currentShapeRef = new google.maps.Circle({
            center: props.restaurantLocation,
            radius: maxRadius,
            map: mapInstance,
            ...selectedZoneOptions
        });

        // clearBtn.style.display = 'block';
        // drawingManager?.setDrawingMode(null);
        // drawingManager?.setOptions({
        //     drawingControlOptions: {
        //         position: google.maps.ControlPosition.TOP_CENTER,
        //         drawingModes: []
        //     }
        // });
        onShapeComplete({
            overlay: currentShapeRef,
            type: google.maps.drawing.OverlayType.CIRCLE
        });
    }
}



onMounted(() => {
    const script = document.querySelector('#google-maps-script')
    if (!script) {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_JS_LIB_KEY}&libraries=drawing,geometry&v=weekly`
        script.id = 'google-maps-script'
        document.head.appendChild(script)
    }
    initMap()
})

const clearShape = () => {
    if (currentShapeRef) {
        google.maps.event.clearInstanceListeners(currentShapeRef);
        currentShapeRef.setMap(null)
        currentShapeRef = null;

        drawingManager?.setDrawingMode(null);
        drawingManager?.setOptions({
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                    google.maps.drawing.OverlayType.CIRCLE,
                    google.maps.drawing.OverlayType.POLYGON,
                    google.maps.drawing.OverlayType.RECTANGLE,
                ]
            }
        })
        clearBtn.style.display = 'none'
    }
}

</script>

<template>
    <div class="w-full h-full">
        <!-- <div class="absolute right-24 top-1 z-[1001]">
            <Button v-if="currentShape"
                    type="button"
                    variant="destructive"
                    @click="clearShape">
                <Eraser class="w-4 h-4" />
                Remove Shape
            </Button>
        </div> -->
        <div :id="mapId"
             class="flex-1 w-full h-full">

        </div>

    </div>
</template>

<style>
.gmnoprint[role="menubar"] {
    transform: scale(2) translateY(7px);
}
</style>
