<script lang="ts" setup>
import { MenuJSON } from "lib/types/menuTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-vue-next"
import { useMenuOperations } from '../composables/useMenuOperations';
const { openOptionGroupDialog } = useMenuOperations()

defineProps<{
    menuJSON: MenuJSON,
    optionGroupId: string,
}>()
</script>
<template>
    <Card class="flex flex-col">
        <CardHeader>
            <CardTitle class="flex items-center justify-between">
                <span>{{ menuJSON.allOptionGroups?.[optionGroupId]?.optionGroupLabel }}</span>
                <Button variant="ghost"
                        size="icon"
                        @click="openOptionGroupDialog(optionGroupId!)">
                    <Pencil class="w-4 h-4" />
                </Button>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div class="text-sm text-muted-foreground">
                (
                min: {{ menuJSON.allOptionGroups?.[optionGroupId]?.minOptions }} -
                max: {{ menuJSON.allOptionGroups?.[optionGroupId]?.maxOptions }}
                )
            </div>
            <div class="mt-2">
                <div v-for="option in menuJSON.allOptionGroups?.[optionGroupId]?.options"
                     :key="typeof option === 'string' ? option : option?.optionId"
                     class="text-sm">
                    {{ typeof option === 'string' ? option : option?.label }}
                    <span v-if="typeof option !== 'string' && option?.price">
                        (+${{ option.price }})
                    </span>
                </div>
            </div>
        </CardContent>
    </Card>
</template>