
export const fixLinks = () => {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        // add all query params to the link
        const url = new URL(link.href);
        url.search = new URLSearchParams(window.location.search).toString();
        // url.hash = window.location.hash;
        link.href = url.toString();
    });

}

fixLinks();