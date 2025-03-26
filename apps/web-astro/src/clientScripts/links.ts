

export const BASE_LINKS = {
    HOME: "/",
    HOME_UPDATE_ADDRESS: "/?update-address=1",
    LIST_RESTAURANTS: "/restaurants",
    RESTAURANT: function (id: string) {
        return `/restaurant/${id}`;
    },
}