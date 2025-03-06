<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import { dashboardApiClient } from '@src/lib/dashboardApiClient'
import { currentRestaurantId } from '@src/stores/RestaurantStore'
import { toast } from '@/ui-plus/sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { pageTitle } from '@src/stores/layout.store'

const isLoading = ref(false)
const offersOnPremise = ref(false)

const loadData = async () => {
    isLoading.value = true
    try {
        const { data, error } = await (await dashboardApiClient.api_dashboard.restaurant[':restaurantId'].$post({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                columns: {
                    offersOnPremise: true,
                }
            }
        })).json()

        if (error) {
            toast.error('Failed to load on-premise settings')
        } else if (data) {
            offersOnPremise.value = data.offersOnPremise
        }
    } catch (error) {
        console.error('Error loading on-premise settings:', error)
        toast.error('Failed to load on-premise settings')
    } finally {
        isLoading.value = false
    }
}

const saveOnPremiseOption = async () => {
    isLoading.value = true
    try {
        const { error } = await (await dashboardApiClient.api_dashboard.restaurant[':restaurantId'].$patch({
            param: {
                restaurantId: currentRestaurantId.value ?? '',
            },
            json: {
                offersOnPremise: offersOnPremise.value
            }
        })).json()

        if (error) {
            toast.error('Failed to save on-premise settings')
        } else {
            toast.success('On-premise settings saved successfully')
        }
    } catch (error) {
        console.error('Error saving on-premise settings:', error)
        toast.error('Failed to save on-premise settings')
    } finally {
        isLoading.value = false
    }
}

pageTitle.value = 'On-Premise'

onMounted(() => {
    loadData()
})
</script>

<template>
    <div>
        <div class="max-w-lg mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>On-Premise Settings</CardTitle>
                    <CardDescription>Configure if you offer on-premise service at your location</CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="space-y-6">
                        <label for="offersOnPremise"
                               class="flex items-center justify-between p-4 border rounded-lg cursor-pointer">
                            <div class="space-y-0.5">
                                <h3 class="text-lg font-medium">On-Premise Service Availability</h3>
                                <p class="text-muted-foreground">Do you offer on-premise service at your location?</p>
                            </div>
                            <div class="flex items-center space-x-3">
                                <Switch id="offersOnPremise"
                                        :checked="offersOnPremise"
                                        @update:checked="(checked) => offersOnPremise = checked"
                                        :disabled="isLoading"
                                        class="scale-125">
                                </Switch>
                                <span class="font-medium">{{ offersOnPremise ? 'Yes' : 'No' }}</span>
                            </div>
                        </label>

                        <Button @click="saveOnPremiseOption"
                                :disabled="isLoading"
                                class="w-full">
                            <Loader2 v-if="isLoading"
                                     class="mr-2 h-4 w-4 animate-spin" />
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>