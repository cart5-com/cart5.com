<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Register from "./auth/register/Register.vue";
import Login from "./auth/Login.vue";
import OTP from "./auth/otp/OTP.vue";
</script>

<template>
	<Tabs default-value="one-time-password"
		  class="w-full">
		<TabsList class="grid  grid-cols-3">
			<TabsTrigger value="one-time-password"> OTP </TabsTrigger>
			<TabsTrigger value="register"> Register </TabsTrigger>
			<TabsTrigger value="login"> Login </TabsTrigger>
		</TabsList>
		<TabsContent value="one-time-password">
			<OTP />
		</TabsContent>
		<TabsContent value="register">
			<Register />
		</TabsContent>
		<TabsContent value="login">
			<Login />
		</TabsContent>
	</Tabs>
</template>
