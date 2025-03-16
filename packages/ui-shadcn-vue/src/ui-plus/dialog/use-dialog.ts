import { type Component, ref, markRaw, h } from "vue";
import LoadingSpinner from "./LoadingSpinner.vue";

export interface DialogOptions<TResult = any> {
  id?: string;
  component?: Component;
  html?: string;
  props?: Record<string, any>;
  title?: string;
  dialogContentClass?: string;
  description?: string;
  closeable?: boolean;
  onSuccess?: (result: TResult) => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
}

interface DialogInstance {
  id: string;
  isOpen: boolean;
  options: DialogOptions;
}

interface DialogState {
  dialogs: DialogInstance[];
}

const state = ref<DialogState>({
  dialogs: [],
});

export function useDialog() {
  const show = <TResult = any>(options: DialogOptions<TResult>): string => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const id = options.id || `dialog-${Math.random().toString(36).substring(2, 15)}`;
    function getComponent() {
      // import { defineComponent } from "vue";
      // let component: Component | undefined;
      // if (options.html) {
      //   console.warn(`dialog html requires alias to be set in vite config, {"vite":{"resolve":{"alias":{"vue":"vue/dist/vue.esm-bundler.js"}}}}`);
      //   component = defineComponent({
      //     template: options.html,
      //   });
      // } else if (options.component) {
      //   component = options.component;
      // }
      // return component ? markRaw(component) : undefined;
      // return options.component ? markRaw(options.component) : undefined;
      return options.component ? markRaw({
        render: () => h(options.component as Component, options.props)
      }) : undefined;
    }

    setTimeout(() => {
      state.value.dialogs.push({
        id,
        isOpen: true,
        options: {
          ...options,
          component: getComponent(),
          onSuccess: (result) => {
            options.onSuccess?.(result);
          },
          onCancel: () => {
            options.onCancel?.();
          },
          onError: (error) => {
            options.onError?.(error);
          }
        },
      });
    })

    return id;
  };

  const onError = (id: string, error?: any) => {
    const dialogIndex = state.value.dialogs.findIndex(d => d.id === id);
    if (dialogIndex === -1) return;

    const dialog = state.value.dialogs[dialogIndex];
    dialog.options.onError?.(error);

    state.value.dialogs.splice(dialogIndex, 1);
  };

  const close = (id: string, result?: any) => {
    const dialogIndex = state.value.dialogs.findIndex(d => d.id === id);
    if (dialogIndex === -1) return;

    const dialog = state.value.dialogs[dialogIndex];
    dialog.options.onSuccess?.(result);

    state.value.dialogs.splice(dialogIndex, 1);
  };

  const cancel = (id: string) => {
    const dialogIndex = state.value.dialogs.findIndex(d => d.id === id);
    if (dialogIndex === -1) return;

    const dialog = state.value.dialogs[dialogIndex];
    dialog.options.onCancel?.();

    state.value.dialogs.splice(dialogIndex, 1);
  };

  const getDialog = (id: string) => {
    return state.value.dialogs.find(d => d.id === id);
  };

  const showBlockingLoadingModal = () => {
    return show({
      component: LoadingSpinner,
      closeable: false,
    });
  }

  return {
    state,
    show,
    close,
    onError,
    cancel,
    getDialog,
    showBlockingLoadingModal,
  };
}