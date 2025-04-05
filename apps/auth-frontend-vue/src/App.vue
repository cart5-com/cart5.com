<script setup lang="ts">
import LayoutHelpers from '@/ui-plus/LayoutHelpers.vue'
import DarkModeToggle from '@/ui-plus/DarkModeToggle.vue'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import Logo from '@auth-frontend-vue/components/Logo.vue';
import { queryParamsStore } from '@auth-frontend-vue/stores/QueryParams.store'
import { userStore } from '@auth-frontend-vue/stores/User.store'
import SettingsView from '@auth-frontend-vue/views/user/SettingsView.vue';
import LoginView from '@auth-frontend-vue/views/auth/LoginView.vue';
import SignupView from '@auth-frontend-vue/views/auth/SignupView.vue';
import OtpView from '@auth-frontend-vue/views/auth/OtpView.vue';
import AskView from '@auth-frontend-vue/views/user/AskView.vue';
import { showTurnstile } from '@/ui-plus/dialog/showTurnstile';
import { onMounted } from 'vue';
import { getNextUrl } from '@auth-frontend-vue/lib/queryHelpers';
import { useDialog } from "@/ui-plus/dialog/use-dialog";
import { authApiClient } from '@api-client/auth';
import { toast } from '@/ui-plus/sonner'
const dialog = useDialog();

onMounted(async () => {
  if (queryParamsStore.value.type === 'turnstile') {
    if (window.opener) {
      const result = await showTurnstile(import.meta.env.VITE_PUBLIC_TURNSTILE_SITE_KEY);
      const nextUrl = getNextUrl();
      if (!nextUrl) {
        return;
      }
      const loadingModal = dialog.showBlockingLoadingModal();
      const { data, error } = await (await authApiClient.auth["user"]['encrypt-turnstile'].$post({
        form: {
          redirectUrl: nextUrl,
          turnstile: result
        },
      })).json()
      if (error) {
        dialog.close(loadingModal);
        toast.error(error.message ?? 'An error occurred');
      } else {
        window.opener.postMessage({
          type: 'turnstile-verification',
          data: data,
          state: queryParamsStore.value.state
        }, new URL(nextUrl).origin);
      }
    }
  }
})


</script>

<template>
  <div class="mx-auto w-full sm:max-w-[600px]">
    <div v-if="queryParamsStore.type === 'turnstile'">

    </div>
    <div v-else>
      <Logo />
      <Tabs v-if="userStore === null"
            v-model="queryParamsStore.auth!"
            class="container max-w-lg mx-auto px-4">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="login">
            {{ $t('login') }}
          </TabsTrigger>
          <TabsTrigger value="signup">
            {{ $t('signup') }}
          </TabsTrigger>
          <TabsTrigger value="otp">
            {{ $t('otp') }}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginView />
        </TabsContent>
        <TabsContent value="signup">
          <SignupView />
        </TabsContent>
        <TabsContent value="otp">
          <OtpView />
        </TabsContent>
      </Tabs>
      <div v-else>
        <div v-if="queryParamsStore.type === 'ask'">
          <AskView />
        </div>
        <div v-else-if="queryParamsStore.type === 'settings'">
          <SettingsView />
        </div>
      </div>
    </div>


    <LayoutHelpers />
    <div class="mx-auto my-4 max-w-fit">
      <DarkModeToggle />
    </div>
  </div>
</template>
