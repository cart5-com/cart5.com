

export const BASE_LINKS = {
    HOME: "/",
    HOME_UPDATE_ADDRESS: "/?update-address=1",
    LIST_STORES: "/stores",
    STORE: function (id: string, slug?: string, orderType?: string) {
        return `/store/${id}${slug ? `/${slug}` : ""}${orderType ? `?order-type=${orderType}` : ""}`;
    },
}