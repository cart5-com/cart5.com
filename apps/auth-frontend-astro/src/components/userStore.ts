import { reactive } from 'vue'
import type { User } from "../../../auth-api-hono/src/authApiClient";

export const userStore = reactive({
    user: null as User | null,
    setUser(userData: User | null) {
        this.user = userData
    }
})