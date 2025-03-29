<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import { apiClient } from '@api-client/index'
import { currentStoreId } from '@dashboard-spa-vue/stores/StoreStore'
import { toast } from '@/ui-plus/sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { pageTitle } from '@dashboard-spa-vue/stores/layout.store'

const isLoading = ref(false)
const offersPickup = ref(false)

const loadData = async () => {
    isLoading.value = true
    try {
        const { data, error } = await (await apiClient.dashboard.store[':storeId'].$post({
            param: {
                storeId: currentStoreId.value ?? '',
            },
            json: {
                columns: {
                    offersPickup: true,
                }
            }
        })).json()

        if (error) {
            toast.error('Failed to load pickup settings')
        } else if (data) {
            offersPickup.value = data.offersPickup
        }
    } catch (error) {
        console.error('Error loading pickup settings:', error)
        toast.error('Failed to load pickup settings')
    } finally {
        isLoading.value = false
    }
}

const savePickupOption = async () => {
    isLoading.value = true
    try {
        const { error } = await (await apiClient.dashboard.store[':storeId'].$patch({
            param: {
                storeId: currentStoreId.value ?? '',
            },
            json: {
                offersPickup: offersPickup.value
            }
        })).json()

        if (error) {
            toast.error('Failed to save pickup settings')
        } else {
            toast.success('Pickup settings saved successfully')
        }
    } catch (error) {
        console.error('Error saving pickup settings:', error)
        toast.error('Failed to save pickup settings')
    } finally {
        isLoading.value = false
    }
}

pageTitle.value = 'Pickup'

onMounted(() => {
    loadData()
})
</script>

<template>
    <div>
        <div class="max-w-lg mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Pickup Settings</CardTitle>
                    <CardDescription>Configure if you offer pickup from your location</CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="space-y-6">
                        <label for="offersPickup"
                               class="flex items-center justify-between p-4 border rounded-lg cursor-pointer">
                            <div class="space-y-0.5">
                                <h3 class="text-lg font-medium">Pickup Availability</h3>
                                <p class="text-muted-foreground">Do you offer pickup from your location?</p>
                            </div>
                            <div class="flex items-center space-x-3">
                                <Switch id="offersPickup"
                                        :checked="offersPickup"
                                        @update:checked="(checked) => offersPickup = checked"
                                        :disabled="isLoading"
                                        class="scale-125">
                                </Switch>
                                <span class="font-medium">{{ offersPickup ? 'Yes' : 'No' }}</span>
                            </div>
                        </label>

                        <Button @click="savePickupOption"
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