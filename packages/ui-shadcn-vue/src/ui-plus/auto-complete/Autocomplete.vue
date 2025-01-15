<script lang="ts" setup>
import { ref } from "vue";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-vue-next";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "vue";
import { useVModel } from "@vueuse/core";
import { onClickOutside } from "@vueuse/core";

const currentFocusIndex = ref(-1);
const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);
onClickOutside(containerRef, () => {
	isOpen.value = false;
});

function handleFocus() {
	isOpen.value = true;
}

defineOptions({
	inheritAttrs: false
});

const props = defineProps<{
	options: string[];
	isInputLoading?: boolean;
	isTextarea?: boolean;
	class?: HTMLAttributes["class"];
	defaultValue?: string | number;
	modelValue?: string | number;
}>();

const emit = defineEmits<{
	(e: "inputChange", event: Event): void;
	(e: "optionClick", index: number): void;
	(e: "update:modelValue", payload: string | number): void;
}>();

const modelValue = useVModel(props, "modelValue", emit, {
	passive: true,
	defaultValue: props.defaultValue
});

function handleKeyDown(event: KeyboardEvent) {
	if (!props.options.length) return;
	if (event.key === "ArrowDown") {
		event.preventDefault();
		currentFocusIndex.value = Math.min(currentFocusIndex.value + 1, props.options.length - 1);
		focusButton(event.currentTarget as HTMLElement);
	} else if (event.key === "ArrowUp") {
		event.preventDefault();
		currentFocusIndex.value = Math.max(currentFocusIndex.value - 1, -1);
		if (currentFocusIndex.value === -1) {
			((event.currentTarget as HTMLElement).querySelector("input, textarea") as HTMLElement)?.focus();
		} else {
			focusButton(event.currentTarget as HTMLElement);
		}
	}
}

function focusButton(containerElement: HTMLElement) {
	const buttons = containerElement.querySelectorAll(":scope > div > .autocomplete-item");
	(buttons[currentFocusIndex.value] as HTMLElement)?.focus();
}

let lastQuery = modelValue.value;
function handleKeyUp(event: KeyboardEvent) {
	if (event.key === "ArrowDown" || event.key === "ArrowUp") {
		return;
	}
	if (event.key === "Enter") {
		isOpen.value = false;
		return;
	}
	isOpen.value = true;
	currentFocusIndex.value = -1;
	const query = (event.target as HTMLInputElement).value;
	if (query === lastQuery) return;
	lastQuery = query;
	emit("inputChange", event);
}

// , event: Event
// if (event.currentTarget) {
// 	const containerElement = (event.currentTarget as HTMLElement).closest(".autocomplete-container-element") as HTMLElement;
// 	if (containerElement) {
// 		const inputElement = containerElement.querySelector("input, textarea") as HTMLElement;
// 		if (inputElement) {
// 			inputElement.focus();
// 		}
// 	}
// }
function onOptionClick(index: number) {
	isOpen.value = false;
	emit("optionClick", index);
}
</script>

<template>
	<div ref="containerRef"
		 :class="cn('autocomplete-container-element relative', props.class)"
		 @keydown="handleKeyDown">
		<Textarea v-if="isTextarea"
				  v-model="modelValue"
				  v-bind="$attrs"
				  @keyup="handleKeyUp"
				  @focus="handleFocus" />
		<Input v-else
			   v-model="modelValue"
			   v-bind="$attrs"
			   @keyup="handleKeyUp"
			   @focus="handleFocus" />
		<!-- :disabled="isInputLoading" -->
		<Skeleton class="bg-foreground h-1 w-full"
				  v-if="isInputLoading" />
		<div v-if="isOpen"
			 class="bg-background absolute left-0 top-full w-full overflow-y-auto max-h-[50vh] border border-foreground">
			<Button type="button"
					class="autocomplete-item focus:bg-muted mt-[1px] flex h-fit w-full justify-between whitespace-break-spaces text-left"
					variant="outline"
					v-for="(item, index) in options"
					:key="index"
					@click="onOptionClick(index)">
				{{ item }}
				<ChevronRight class="h-4 w-4" />
			</Button>
		</div>
	</div>
</template>
