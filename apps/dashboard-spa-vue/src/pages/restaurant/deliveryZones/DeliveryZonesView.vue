<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ref, onMounted } from 'vue'

type Point = { lat: number, lng: number };

type Circle = {
    center: Point;
    radius: number;
};

type Rectangle = {
    topLeft: Point;
    bottomRight: Point;
};

type DeliveryZone = {
    id: string;
    name?: string;
    hexColor?: string;
    minCart?: number;
    deliveryFee?: number;
    deliveryFeePerKm?: number;
    shapeType: 'polygon' | 'circle' | 'rectangle';
    polygonArea?: Point[];
    circleArea?: Circle;
    rectangleArea?: Rectangle;
    isActive: boolean;
};

const restaurantLocation = { lat: 43.64765326293569, lng: -79.37036985441075 }
const map = ref<google.maps.Map | null>(null)
const randomId = `gmap-${Math.random().toString(36).substring(2, 15)}`
const deliveryZones = ref<DeliveryZone[]>([])
const activeZones = ref<Map<string, google.maps.Circle | google.maps.Polygon | google.maps.Rectangle>>(new Map())
const selectedZoneId = ref<string | null>(null)
const drawingManager = ref<google.maps.drawing.DrawingManager | null>(null)

const generateRandomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16)
}

const selectZone = (zoneId: string) => {
    // First make all shapes non-editable and non-draggable
    activeZones.value.forEach(shape => {
        shape.setEditable(false)
        shape.setDraggable(false)
    })

    // Then make selected shape editable and draggable
    const selectedShape = activeZones.value.get(zoneId)
    if (selectedShape) {
        selectedShape.setEditable(true)
        selectedShape.setDraggable(true)
        selectedZoneId.value = zoneId
    }
}

const deleteZone = (zoneId: string) => {
    const shape = activeZones.value.get(zoneId)
    if (shape) {
        shape.setMap(null) // Remove from map
        activeZones.value.delete(zoneId)
    }
    deliveryZones.value = deliveryZones.value.filter(z => z.id !== zoneId)
    if (selectedZoneId.value === zoneId) {
        selectedZoneId.value = null
    }
}

const createDeliveryZone = (
    shape: google.maps.Circle | google.maps.Polygon | google.maps.Rectangle,
    shapeType: DeliveryZone['shapeType']
) => {
    const newZone: DeliveryZone = {
        id: crypto.randomUUID(),
        name: `Zone ${deliveryZones.value.length + 1}`,
        hexColor: shape.get('fillColor'), // Get the color from the shape
        shapeType: shapeType,
        isActive: true,
    }

    // Store shape-specific data
    if (shapeType === 'circle') {
        const circle = shape as google.maps.Circle
        newZone.circleArea = {
            center: {
                lat: circle.getCenter()!.lat(),
                lng: circle.getCenter()!.lng()
            },
            radius: circle.getRadius()
        }
    } else if (shapeType === 'polygon') {
        const polygon = shape as google.maps.Polygon
        newZone.polygonArea = polygon.getPath().getArray().map(point => ({
            lat: point.lat(),
            lng: point.lng()
        }))
    } else if (shapeType === 'rectangle') {
        const rectangle = shape as google.maps.Rectangle
        const bounds = rectangle.getBounds()!
        newZone.rectangleArea = {
            topLeft: {
                lat: bounds.getNorthEast().lat(),
                lng: bounds.getSouthWest().lng()
            },
            bottomRight: {
                lat: bounds.getSouthWest().lat(),
                lng: bounds.getNorthEast().lng()
            }
        }
    }

    deliveryZones.value.push(newZone)
    activeZones.value.set(newZone.id, shape)
    shape.setEditable(false) // Make new shapes non-editable by default
    shape.setDraggable(false) // Make new shapes non-draggable by default
    shape.setOptions({ clickable: true }) // Make shape clickable

    // Add click listener to select the zone when shape is clicked
    shape.addListener('click', () => {
        selectZone(newZone.id)
    })

    // Add event listeners for shape changes
    if (shapeType === 'circle') {
        const circle = shape as google.maps.Circle
        circle.addListener('radius_changed', () => updateZoneShape(newZone.id))
        circle.addListener('center_changed', () => updateZoneShape(newZone.id))
        circle.addListener('dragend', () => updateZoneShape(newZone.id))
    } else if (shapeType === 'polygon') {
        const polygon = shape as google.maps.Polygon
        google.maps.event.addListener(polygon.getPath(), 'set_at', () => updateZoneShape(newZone.id))
        google.maps.event.addListener(polygon.getPath(), 'insert_at', () => updateZoneShape(newZone.id))
        polygon.addListener('dragend', () => updateZoneShape(newZone.id))
    } else if (shapeType === 'rectangle') {
        const rectangle = shape as google.maps.Rectangle
        rectangle.addListener('bounds_changed', () => updateZoneShape(newZone.id))
        rectangle.addListener('dragend', () => updateZoneShape(newZone.id))
    }
    selectZone(newZone.id)
}

const updateZoneShape = (zoneId: string) => {
    const zone = deliveryZones.value.find(z => z.id === zoneId)
    const shape = activeZones.value.get(zoneId)

    if (!zone || !shape) return

    if (zone.shapeType === 'circle') {
        const circle = shape as google.maps.Circle
        zone.circleArea = {
            center: {
                lat: circle.getCenter()!.lat(),
                lng: circle.getCenter()!.lng()
            },
            radius: circle.getRadius()
        }
    } else if (zone.shapeType === 'polygon') {
        const polygon = shape as google.maps.Polygon
        zone.polygonArea = polygon.getPath().getArray().map(point => ({
            lat: point.lat(),
            lng: point.lng()
        }))
    } else if (zone.shapeType === 'rectangle') {
        const rectangle = shape as google.maps.Rectangle
        const bounds = rectangle.getBounds()!
        zone.rectangleArea = {
            topLeft: {
                lat: bounds.getNorthEast().lat(),
                lng: bounds.getSouthWest().lng()
            },
            bottomRight: {
                lat: bounds.getSouthWest().lat(),
                lng: bounds.getNorthEast().lng()
            }
        }
    }
}

const startDrawing = (type: 'circle' | 'polygon' | 'rectangle') => {
    if (!drawingManager.value) return

    const color = generateRandomColor()
    const newOptions = {
        clickable: true,
        editable: false,
        draggable: false,
        fillColor: color,
        fillOpacity: 0.35,
        strokeWeight: 2
    }

    drawingManager.value.setOptions({
        polygonOptions: newOptions,
        rectangleOptions: newOptions,
        circleOptions: newOptions
    })

    switch (type) {
        case 'circle':
            drawingManager.value.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE)
            break
        case 'polygon':
            drawingManager.value.setDrawingMode(google.maps.drawing.OverlayType.POLYGON)
            break
        case 'rectangle':
            drawingManager.value.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE)
            break
    }
}

const initMap = async () => {
    while (!window.google) {
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    map.value = new google.maps.Map(
        document.getElementById(randomId) as HTMLElement,
        {
            center: restaurantLocation,
            zoom: 16,
            mapTypeControl: false,
            streetViewControl: false
        }
    )

    // Add restaurant marker
    new google.maps.Marker({
        position: restaurantLocation,
        map: map.value,
        title: 'Restaurant Location'
    })

    // const pinScaled = new google.maps.marker.PinElement({
    //     scale: 1.5,
    // });
    // const markerViewScaled = new google.maps.marker.AdvancedMarkerElement({
    //     map: map.value,
    //     position: restaurantLocation,
    //     content: pinScaled.element,
    // });

    // const markerViewWithText = new google.maps.marker.AdvancedMarkerElement({
    //     map: map.value,
    //     position: restaurantLocation,
    //     title: 'Restaurant Location',
    // });

    const defaultShapeOptions = {
        clickable: true,
        editable: false,
        draggable: false,
        fillColor: generateRandomColor(),
        fillOpacity: 0.35,
        strokeWeight: 2
    }

    drawingManager.value = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        polygonOptions: defaultShapeOptions,
        rectangleOptions: defaultShapeOptions,
        circleOptions: defaultShapeOptions
    })

    drawingManager.value.setMap(map.value)

    google.maps.event.addListener(drawingManager.value, "overlaycomplete", (_r: any) => {
        drawingManager.value?.setDrawingMode(null);
    })

    google.maps.event.addListener(drawingManager.value, 'circlecomplete', (circle: google.maps.Circle) => {
        createDeliveryZone(circle, 'circle')
    })

    google.maps.event.addListener(drawingManager.value, 'polygoncomplete', (polygon: google.maps.Polygon) => {
        createDeliveryZone(polygon, 'polygon')
    })

    google.maps.event.addListener(drawingManager.value, 'rectanglecomplete', (rectangle: google.maps.Rectangle) => {
        createDeliveryZone(rectangle, 'rectangle')
    })
}

onMounted(() => {
    const script = document.querySelector('#google-maps-script')
    if (!script) {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_JS_LIB_KEY}&libraries=drawing&v=weekly`
        script.id = 'google-maps-script'
        document.head.appendChild(script)
    }
    initMap()
})
</script>

<template>
    <div class="h-full w-full">
        <div class="flex flex-col h-full">
            <div class="p-4 space-x-2 h-52 max-h-52 overflow-y-auto">
                <div class="text-xl font-bold mb-4">Delivery Zones</div>
                <div class="flex space-x-2 mb-4">
                    <Button variant="outline"
                            size="sm"
                            @click="startDrawing('circle')">Add Circle</Button>
                    <Button variant="outline"
                            size="sm"
                            @click="startDrawing('polygon')">Add Polygon</Button>
                    <Button variant="outline"
                            size="sm"
                            @click="startDrawing('rectangle')">Add Rectangle</Button>
                </div>
                <div class="space-y-2">
                    <div v-for="zone in deliveryZones"
                         :key="zone.id"
                         class="flex items-center space-x-2">
                        <div class="w-4 h-4"
                             :style="{ backgroundColor: zone.hexColor }"></div>
                        <div>
                            {{ zone.name }}
                            <details>
                                <summary>🔴more</summary>
                                <pre>{{ zone }}</pre>
                            </details>
                        </div>

                        <Button variant="outline"
                                size="sm"
                                :class="{ 'bg-primary text-primary-foreground': selectedZoneId === zone.id }"
                                @click="selectZone(zone.id)">
                            {{ selectedZoneId === zone.id ? 'Selected' : 'Select' }}
                        </Button>
                        <Button variant="destructive"
                                size="sm"
                                @click="deleteZone(zone.id)">
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
            <div :id="randomId"
                 class="flex-1"></div>
        </div>
    </div>
</template>