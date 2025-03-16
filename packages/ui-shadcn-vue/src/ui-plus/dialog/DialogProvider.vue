<script setup lang="ts">
import { Dialog, DialogHeader, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import DialogScrollContent from "./DialogScrollContent.vue"; // use modified DialogContent
import { useDialog } from "./use-dialog";

const { state, close, cancel, onError } = useDialog();

const handleUpdateOpen = (dialogId: string, val: boolean) => {
	if (!val) {
		const dialog = state.value.dialogs.find((d) => d.id === dialogId);
		if (dialog?.options.closeable !== false) {
			cancel(dialogId);
		}
	}
};
</script>

<template>
	<template v-for="dialog in state.dialogs"
			  :key="dialog.id">
		<Dialog :open="dialog.isOpen"
				@update:open="(val) => handleUpdateOpen(dialog.id, val)">
			<DialogScrollContent :closeable="dialog.options?.closeable"
								 :class="dialog.options?.dialogContentClass">
				<template #title>
					<DialogHeader>
						<DialogTitle class="text-xl sm:text-2xl font-bold line-clamp-1"
									 v-if="dialog.options?.title">
							{{ dialog.options?.title }}
						</DialogTitle>
						<DialogDescription class="text-sm line-clamp-2"
										   :title="dialog.options?.description">
							{{ dialog.options?.description }}
						</DialogDescription>
					</DialogHeader>
				</template>

				<DialogHeader>
					<DialogTitle class="text-2xl sm:text-3xl font-bold"
								 v-if="dialog.options?.title">
						{{ dialog.options?.title }}
					</DialogTitle>
					<DialogDescription class="text-sm"
									   :title="dialog.options?.description">
						{{ dialog.options?.description }}
					</DialogDescription>
				</DialogHeader>


				<component v-if="dialog.options?.component"
						   :is="dialog.options.component"
						   v-bind="dialog.options.props"
						   @onError="(error: any) => onError(dialog.id, error)"
						   @close="(result: any) => close(dialog.id, result)"
						   @cancel="() => cancel(dialog.id)" />

				<div v-if="dialog.options?.html"
					 v-html="dialog.options.html" />
			</DialogScrollContent>
		</Dialog>
	</template>
</template>
