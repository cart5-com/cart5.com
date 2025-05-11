<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DarkModeToggleSubMenu from '@/ui-plus/DarkModeToggleSubMenu.vue';
import { Button } from "@/components/ui/button";
import { killApp } from '../utils/killApp';
import { restartApp } from '../utils/restartApp';
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button variant="ghost"
                    size="icon">
                <MoreHorizontal />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem class="bg-destructive text-destructive-foreground"
                              @click="killApp">
                Quit (Kill auto print app)
            </DropdownMenuItem>
            <DropdownMenuItem @click="restartApp">
                Restart
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DarkModeToggleSubMenu />
        </DropdownMenuContent>
    </DropdownMenu>
</template>