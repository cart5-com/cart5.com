import { formatDate } from "@lib/utils/formatDate";

const cacheDateSpanElements = document.querySelectorAll<HTMLSpanElement>(".cache-date");
cacheDateSpanElements.forEach((cacheDateSpanElement) => {
    cacheDateSpanElement.textContent = formatDate(Number(cacheDateSpanElement.dataset.cacheDate));
});