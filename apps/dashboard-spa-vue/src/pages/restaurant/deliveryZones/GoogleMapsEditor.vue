<script setup lang="ts">
import { onMounted } from 'vue'
import type { DeliveryZone, Point } from '@lib/types/restaurantTypes'
import { toast } from '@/ui-plus/sonner';

const props = defineProps<{
    deliveryZones: DeliveryZone[]
    restaurantLocation: Point
    selectedZone: DeliveryZone | null
}>()


const mapId = `gmap-${Math.random().toString(36).substring(2, 15)}`
let mapInstance: google.maps.Map | null = null
let drawingManager: google.maps.drawing.DrawingManager | null = null
let currentShapeRef: google.maps.Polygon | google.maps.Circle | google.maps.Rectangle | undefined = undefined;

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
    strokeWeight: 1,
    zIndex: 100
}

const selectedZoneOptions = {
    clickable: true,
    editable: true,
    draggable: true,
    fillOpacity: 0.3,
    strokeColor: '#ff0000',
    fillColor: '#ff0000',
    strokeWeight: 1,
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
        if (zone && zone.circleArea &&
            zone.circleArea.center &&
            zone.circleArea.center.lat &&
            zone.circleArea.center.lng &&
            zone.circleArea.radius
        ) {
            const circle = new google.maps.Circle({
                center: {
                    lat: zone.circleArea.center.lat,
                    lng: zone.circleArea.center.lng
                },
                radius: zone.circleArea.radius,
                map: mapInstance,
                ...shapeOptions,
            });
            bounds.extend(circle.getCenter()!);
            const radius = circle.getRadius()!;
            bounds.extend(google.maps.geometry.spherical.computeOffset(circle.getCenter()!, radius, 0));
            bounds.extend(google.maps.geometry.spherical.computeOffset(circle.getCenter()!, radius, 180));
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
            const rectangle = new google.maps.Rectangle({
                bounds: {
                    north: zone.rectangleArea.topLeft.lat,
                    south: zone.rectangleArea.bottomRight.lat,
                    east: zone.rectangleArea.bottomRight.lng,
                    west: zone.rectangleArea.topLeft.lng
                },
                map: mapInstance,
                ...shapeOptions,
            });
            bounds.union(rectangle.getBounds()!);
            return rectangle;
        }
    } else {
        return undefined
    }
}

const initMap = async () => {
    while (!window.google) {
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    mapInstance = new google.maps.Map(document.getElementById(mapId) as HTMLElement, {
        center: {
            lat: props.restaurantLocation.lat ?? 0,
            lng: props.restaurantLocation.lng ?? 0
        },
        zoom: 16,
        mapTypeId: "OSM",
        mapTypeControl: false,
    });

    mapInstance.mapTypes.set("OSM", new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            // "Wrap" x (longitude) at 180th meridian properly
            // NB: Don't touch coord.x: because coord param is by reference, and changing its x property breaks something in Google's lib
            var tilesPerGlobe = 1 << zoom;
            var x = coord.x % tilesPerGlobe;
            if (x < 0) {
                x = tilesPerGlobe + x;
            }
            // Wrap y (latitude) in a like manner if you want to enable vertical infinite scrolling
            return `https://tile.openstreetmap.org/${zoom}/${x}/${coord.y}.png`;
            // or we can use google maps tiles, but I am not sure about TOS
            // const subdomains = ["mt0", "mt1", "mt2", "mt3"];
            // const subdomain = subdomains[Math.floor(Math.random() * subdomains.length)];
            // return `https://${subdomain}.google.com/vt/lyrs=m&x=${x}&y=${coord.y}&z=${zoom}`
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OpenStreetMap",
        maxZoom: 18
    }));


    // Add restaurant marker
    new google.maps.Marker({
        position: {
            lat: props.restaurantLocation.lat ?? 0,
            lng: props.restaurantLocation.lng ?? 0
        },
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
                        {
                            lat: props.restaurantLocation.lat ?? 0,
                            lng: props.restaurantLocation.lng ?? 0
                        },
                        {
                            lat: point.lat ?? 0,
                            lng: point.lng ?? 0
                        }
                    );
                    maxRadius = Math.max(maxRadius, distance);
                });
            } else if (zone.shapeType === 'rectangle' && zone.rectangleArea) {
                // For rectangles, calculate distance to corners
                const corners = [
                    { lat: zone.rectangleArea.topLeft?.lat ?? 0, lng: zone.rectangleArea.topLeft?.lng ?? 0 },
                    { lat: zone.rectangleArea.topLeft?.lat ?? 0, lng: zone.rectangleArea.bottomRight?.lng ?? 0 },
                    { lat: zone.rectangleArea.bottomRight?.lat ?? 0, lng: zone.rectangleArea.topLeft?.lng ?? 0 },
                    { lat: zone.rectangleArea.bottomRight?.lat ?? 0, lng: zone.rectangleArea.bottomRight?.lng ?? 0 }
                ];
                corners.forEach(corner => {
                    const distance = google.maps.geometry.spherical.computeDistanceBetween(
                        {
                            lat: props.restaurantLocation.lat ?? 0,
                            lng: props.restaurantLocation.lng ?? 0
                        },
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
            center: {
                lat: props.restaurantLocation.lat ?? 0,
                lng: props.restaurantLocation.lng ?? 0
            },
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

        toast.info('resize the circle to define your delivery area')
    } else if (mode === google.maps.drawing.OverlayType.POLYGON) {
        toast.info('Start by clicking on the map to define your delivery area')
    } else if (mode === google.maps.drawing.OverlayType.RECTANGLE) {
        toast.info('Start by clicking on the map to define your delivery area')
    }
}



onMounted(() => {
    const script = document.querySelector('#google-maps-script')
    if (!script) {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=drawing,geometry&v=weekly`
        // remove VITE_PUBLIC_GOOGLE_MAPS_JS_LIB_KEY and invalidate from google cloud console
        // script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_JS_LIB_KEY}&libraries=drawing,geometry&v=weekly`
        script.id = 'google-maps-script'
        document.head.appendChild(script)
    }
    initMap()
})

const clearShape = () => {
    if (currentShapeRef) {
        google.maps.event.clearInstanceListeners(currentShapeRef);
        currentShapeRef.setMap(null)
        currentShapeRef = undefined;

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
