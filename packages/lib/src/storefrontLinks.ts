

export const STORE_FRONT_LINKS = {
    HOME: "/",
    HOME_UPDATE_ADDRESS: "/?update-address=1",
    LIST_STORES: "/stores",
    STORE: function (id: string, slug?: string, orderType?: string) {
        return `/store/${id}${slug ? `/${slug}` : ""}${orderType ? `?order-type=${orderType}` : ""}`;
    },
    CHECKOUT: function (id: string, slug?: string) {
        return `/checkout/${id}${slug ? `/${slug}` : ""}`;
    },
    CONFIRM_INFO: function (id: string, slug?: string) {
        return `/confirm-info/${id}${slug ? `/${slug}` : ""}`;
    },
    SHOW_ORDER: function (id: string) {
        return `/show-order/${id}`;
    },
}