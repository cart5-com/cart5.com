
export function openRightDrawer() {
    const rightDrawerLabel = document.querySelector('label[for="right-drawer"]');
    if (rightDrawerLabel) {
        (rightDrawerLabel as HTMLElement).click();
    }
}
