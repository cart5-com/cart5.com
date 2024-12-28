export const setActiveLink = () => {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        if (link.href === window.location.href) {
            link.setAttribute('data-state', 'active');
            link.setAttribute('aria-selected', 'true');
        }
    });
}

setTimeout(() => {
    setActiveLink();
});
