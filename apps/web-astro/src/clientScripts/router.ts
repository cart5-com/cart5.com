

export const BASE_ROUTES = {
    HOME: "/",
    LIST_RESTAURANTS: "/restaurants",
    RESTAURANT: function (id: string) {
        return `/restaurant/${id}`;
    },
}