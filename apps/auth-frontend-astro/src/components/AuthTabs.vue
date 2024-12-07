<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Register from "./auth/Register.vue";
import Login from "src/components/auth/Login.vue";
import OTP from "src/components/auth/OTP.vue";
</script>

<template>
	<Tabs default-value="one-time-password"
		  class="w-full">
		<TabsList class="mx-auto grid w-full grid-cols-3 sm:max-w-[600px]">
			<TabsTrigger value="one-time-password"> OTP </TabsTrigger>
			<TabsTrigger value="register"> Register </TabsTrigger>
			<TabsTrigger value="login"> Login </TabsTrigger>
		</TabsList>
		<div class="mx-auto w-full sm:max-w-[600px]">
			<TabsContent value="one-time-password">
				<OTP />
			</TabsContent>
			<TabsContent value="register">
				<Register />
			</TabsContent>
			<TabsContent value="login">
				<Login />
			</TabsContent>
		</div>
	</Tabs>
</template>
