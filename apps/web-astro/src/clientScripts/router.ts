export const BASE_ROUTES = {
    HOME: "/",
    LIST_RESTAURANTS: "/list",
    RESTAURANT: function (id: string) {
        return `/restaurant/${id}`;
    },
}