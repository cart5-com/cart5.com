import { refreshUserData } from '@src/stores/userStore';
import router from '@src/router';

export async function refreshUserAndRedirectToSavedPath() {
    await refreshUserData();
    const pathname = router.currentRoute.value.query.pathname?.toString();
    const { pathname: _, ...remainingQuery } = router.currentRoute.value.query;

    await router.push({
        path: pathname || '/user/settings',
        query: remainingQuery
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
}