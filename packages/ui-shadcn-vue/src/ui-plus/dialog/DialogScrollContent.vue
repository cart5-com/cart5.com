<script setup lang="ts">
import { cn } from "@/lib/utils";
import { X } from "lucide-vue-next";
import {
	DialogClose,
	DialogContent,
	type DialogContentEmits,
	type DialogContentProps,
	DialogOverlay,
	DialogPortal,
	useForwardPropsEmits
} from "radix-vue";
import { computed, type HTMLAttributes } from "vue";

interface Props extends DialogContentProps {
	class?: HTMLAttributes["class"];
	closeable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	class: "",
	closeable: true
});

const emits = defineEmits<DialogContentEmits>();

const delegatedProps = computed(() => {
	const { class: _, closeable: __, ...delegated } = props;
	return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);

const handleInteractOutside = (event: any) => {
	if ((event.target as HTMLElement)?.closest('[data-sonner-toaster]')) {
		return event.preventDefault();
	}
	if (!props.closeable) {
		event.preventDefault();
		return;
	}
};
</script>

<template>
	<DialogPortal>
		<DialogOverlay
					   class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
			<DialogContent v-bind="forwarded"
						   :class="cn(
							'relative z-50 grid w-full max-w-lg my-8 gap-4 border border-border bg-background sm:p-6 shadow-lg duration-200 sm:rounded-lg md:w-full',
							props.class
						)
							"
						   @interact-outside="handleInteractOutside"
						   @escape-key-down="(e) => !props.closeable && e.preventDefault()"
						   @pointer-down-outside="(event) => {
							const originalEvent = event.detail.originalEvent;
							const target = originalEvent.target as HTMLElement;
							if (originalEvent.offsetX > target.clientWidth || originalEvent.offsetY > target.clientHeight) {
								event.preventDefault();
							}
						}">

				<div class="sticky top-0 w-full bg-background z-50 p-2"
					 v-if="props.closeable">
					<div class="flex items-center justify-between">
						<div class="dialog-header-scroll-animation">
							<slot name="title" />
						</div>
						<DialogClose
									 class="transition-colors rounded-md bg-secondary disabled:pointer-events-none hover:bg-secondary/50">
							<X class="h-8 w-8" />
							<span class="sr-only">Close</span>
						</DialogClose>
					</div>
				</div>
				<slot />

			</DialogContent>
		</DialogOverlay>
	</DialogPortal>
</template>


<style>
@keyframes scroll-animation {
	from {
		opacity: 0;
		transform: translateY(-100%);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.dialog-header-scroll-animation {
	animation: scroll-animation 0.3s ease-in-out;
	animation-timeline: scroll();
	animation-range: 0 20%;
}
</style>
