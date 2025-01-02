<script setup lang="ts">
import LayoutHelpers from '@/ui-plus/LayoutHelpers.vue'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useStore } from '@nanostores/vue'
import Logo from '@src/components/Logo.vue';
import { $queryParamsStore } from '@src/stores/queryParamsStore'
import { $userStore } from '@src/stores/userStore'
import SettingsView from '@src/views/user/SettingsView.vue';
import LoginView from '@src/views/auth/LoginView.vue';
import { ref } from 'vue';
import SignupView from '@src/views/auth/SignupView.vue';
import OtpView from '@src/views/auth/OtpView.vue';
import AskView from '@src/views/user/AskView.vue';

const queryParams = useStore($queryParamsStore);
const user = useStore($userStore);

const currentAuthTab = ref(queryParams.value.auth);
$queryParamsStore.subscribe(value => {
  currentAuthTab.value = value.auth;
});

</script>

<template>
  <div class="mx-auto w-full sm:max-w-[600px]">
    <Logo />
    <Tabs v-if="user === null"
          v-model="currentAuthTab!"
          class="container max-w-lg mx-auto px-4">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="login">
          Login
        </TabsTrigger>
        <TabsTrigger value="signup">
          Signup
        </TabsTrigger>
        <TabsTrigger value="otp">
          OTP
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
      <div v-if="queryParams.type === 'ask'">
        <AskView />
      </div>
      <div v-else-if="queryParams.type === 'settings'">
        <SettingsView />
      </div>
    </div>
    <LayoutHelpers />
  </div>
</template>
