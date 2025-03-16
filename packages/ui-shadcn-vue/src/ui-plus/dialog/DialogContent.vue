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
					   class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80" />
		<DialogContent v-bind="forwarded"
					   :class="cn(
						'bg-card data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-1/2 top-1/2 z-50 grid max-h-screen w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-auto border p-6 shadow-lg duration-200 sm:rounded-lg',
						props.class
					)
						"
					   @interact-outside="handleInteractOutside"
					   @escape-key-down="(e) => !props.closeable && e.preventDefault()">
			<slot />

			<DialogClose v-if="props.closeable"
						 class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none">
				<X class="h-8 w-8" />
				<span class="sr-only">Close</span>
			</DialogClose>
		</DialogContent>
	</DialogPortal>
</template>
