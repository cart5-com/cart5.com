<script setup lang="ts">
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import DialogContent from "./DialogContent.vue"; // use modified DialogContent
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
			<DialogContent :closeable="dialog.options?.closeable"
						   :class="dialog.options?.dialogContentClass">
				<DialogHeader>
					<DialogTitle v-if="dialog.options?.title">
						{{ dialog.options?.title }}
					</DialogTitle>
					<DialogDescription v-if="dialog.options?.description">
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
			</DialogContent>
		</Dialog>
	</template>
</template>
