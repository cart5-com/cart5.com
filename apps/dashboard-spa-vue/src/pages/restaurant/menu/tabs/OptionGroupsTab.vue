<script lang="ts" setup>
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-vue-next";
import OptionGroupCard from "../components/OptionGroupCard.vue";
import { menuJSON } from "../store";


const addNewOptionGroup = () => {
    const newOptionGroupId = `option-group-${Date.now()}`
    if (menuJSON.value) {
        if (!menuJSON.value.allOptionGroups) {
            menuJSON.value.allOptionGroups = {}
        }
        menuJSON.value.allOptionGroups[newOptionGroupId] = {
            optionGroupId: newOptionGroupId,
            optionGroupLabel: `New Option Group`,
        }
    }
}
</script>

<template>
    <div class="p-4">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">All Option Groups</h2>
            <Button variant="outline"
                    @click="addNewOptionGroup">
                <Plus class="w-4 h-4 mr-2" /> Add New Option Group
            </Button>
        </div>

        <div v-if="menuJSON.allOptionGroups"
             class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OptionGroupCard v-for="optionGroup in menuJSON.allOptionGroups"
                             :key="optionGroup.optionGroupId"
                             :menuJSON="menuJSON"
                             :optionGroupId="optionGroup.optionGroupId!">
            </OptionGroupCard>
        </div>
    </div>
</template>