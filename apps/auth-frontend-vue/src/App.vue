<script setup lang="ts">
import LayoutHelpers from '@/ui-plus/LayoutHelpers.vue'
import DarkModeToggle from '@/ui-plus/DarkModeToggle.vue'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import Logo from '@src/components/Logo.vue';
import { queryParamsStore } from '@src/stores/queryParamsStore'
import { userStore } from '@src/stores/userStore'
import SettingsView from '@src/views/user/SettingsView.vue';
import LoginView from '@src/views/auth/LoginView.vue';
import SignupView from '@src/views/auth/SignupView.vue';
import OtpView from '@src/views/auth/OtpView.vue';
import AskView from '@src/views/user/AskView.vue';


</script>

<template>
  <div class="mx-auto w-full sm:max-w-[600px]">
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
    <LayoutHelpers />
    <div class="mx-auto my-4 max-w-fit">
      <DarkModeToggle />
    </div>
  </div>
</template>
