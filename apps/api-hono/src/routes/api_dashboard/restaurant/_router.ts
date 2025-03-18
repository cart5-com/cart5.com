import { Hono } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { createRestaurant_SchemaValidator, createRestaurant_Handler } from "./create.controller";
import { getMyRestaurants_Handler } from "./my_restaurants.controller";
import { getRestaurant_SchemaValidator, getRestaurant_Handler } from "./get.controller";
import { updateRestaurant_SchemaValidator, updateRestaurant_Handler } from "./update.controller";
import { getRestaurantAddress_SchemaValidator, getRestaurantAddress_Handler } from "./address/address_get.controller";
import { updateRestaurantAddress_SchemaValidator, updateRestaurantAddress_Handler } from "./address/address_update.controller";
import { getRestaurantOpenHours_SchemaValidator, getRestaurantOpenHours_Handler } from "./open_hours/open_hours_get.controller";
import { updateRestaurantOpenHours_SchemaValidator, updateRestaurantOpenHours_Handler } from "./open_hours/open_hours_update.controller";
import { getRestaurantMenu_SchemaValidator, getRestaurantMenu_Handler } from "./menu/menu_get.controller";
import { updateRestaurantMenu_SchemaValidator, updateRestaurantMenu_Handler } from "./menu/menu_update.controller";
import { getRestaurantPaymentMethods_SchemaValidator, getRestaurantPaymentMethods_Handler } from "./payment_methods/payment_methods_get.controller";
import { updateRestaurantPaymentMethods_SchemaValidator, updateRestaurantPaymentMethods_Handler } from "./payment_methods/payment_methods_update.controller";
import { getRestaurantTableReservationSettings_SchemaValidator, getRestaurantTableReservationSettings_Handler } from "./table_reservation_settings/table_reservation_settings_get.controller";
import { updateRestaurantTableReservationSettings_SchemaValidator, updateRestaurantTableReservationSettings_Handler } from "./table_reservation_settings/table_reservation_settings_update.controller";
import { getRestaurantTaxSettings_SchemaValidator, getRestaurantTaxSettings_Handler } from "./tax_settings/tax_settings_get.controller";
import { updateRestaurantTaxSettings_SchemaValidator, updateRestaurantTaxSettings_Handler } from "./tax_settings/tax_settings_update.controller";
import { getRestaurantScheduledOrdersSettings_SchemaValidator, getRestaurantScheduledOrdersSettings_Handler } from "./scheduled_orders_settings/scheduled_orders_settings_get.controller";
import { updateRestaurantScheduledOrdersSettings_SchemaValidator, updateRestaurantScheduledOrdersSettings_Handler } from "./scheduled_orders_settings/scheduled_orders_settings_update.controller";
import { getRestaurantDeliveryZones_SchemaValidator, getRestaurantDeliveryZones_Handler } from "./delivery_zones/delivery_zones_get.controller";
import { updateRestaurantDeliveryZones_SchemaValidator, updateRestaurantDeliveryZones_Handler } from "./delivery_zones/delivery_zones_update.controller";
import { createAdminCheckRestaurant } from "@api-hono/utils/checkRestaurantPermissions";
import { TEAM_PERMISSIONS } from "@lib/consts";
import { getRestaurantTeamMembers_Handler } from "./team/team.controller";
import { getRestaurantTeamInvitations_Handler } from "./team/team_invitations.controller";
import { inviteRestaurantTeamMember_SchemaValidator, inviteRestaurantTeamMember_Handler } from "./team/team_invite.controller";
import { cancelRestaurantTeamInvitation_SchemaValidator, cancelRestaurantTeamInvitation_Handler } from "./team/team_invite_cancel.controller";
import { transferRestaurantTeamOwnership_SchemaValidator, transferRestaurantTeamOwnership_Handler } from "./team/team_transfer_ownership.controller";
import { removeRestaurantTeamMember_SchemaValidator, removeRestaurantTeamMember_Handler } from "./team/team_remove_member.controller";
import { updateRestaurantTeamMemberPermissions_SchemaValidator, updateRestaurantTeamMemberPermissions_Handler } from "./team/team_update_permissions.controller";

export const restaurantRouter = new Hono<HonoVariables>()
    .get(
        '/my_restaurants',
        getMyRestaurants_Handler
    )
    .post('/create',
        createRestaurant_SchemaValidator,
        createRestaurant_Handler
    )
    .post('/:restaurantId',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        getRestaurant_SchemaValidator,
        getRestaurant_Handler
    )
    .patch('/:restaurantId',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        updateRestaurant_SchemaValidator,
        updateRestaurant_Handler
    )
    .get(
        '/:restaurantId/team',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        getRestaurantTeamMembers_Handler
    )
    .get(
        '/:restaurantId/team_invitations',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        getRestaurantTeamInvitations_Handler
    )
    .post(
        '/:restaurantId/team_invite',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        inviteRestaurantTeamMember_SchemaValidator,
        inviteRestaurantTeamMember_Handler
    )
    .post(
        '/:restaurantId/team_invite_cancel',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        cancelRestaurantTeamInvitation_SchemaValidator,
        cancelRestaurantTeamInvitation_Handler
    )
    .post(
        '/:restaurantId/team_transfer_ownership',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS
        ]),
        transferRestaurantTeamOwnership_SchemaValidator,
        transferRestaurantTeamOwnership_Handler
    )
    .post(
        '/:restaurantId/team_remove_member',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        removeRestaurantTeamMember_SchemaValidator,
        removeRestaurantTeamMember_Handler
    )
    .post(
        '/:restaurantId/team_update_permissions',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        updateRestaurantTeamMemberPermissions_SchemaValidator,
        updateRestaurantTeamMemberPermissions_Handler
    )
    .post('/:restaurantId/address/get',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        getRestaurantAddress_SchemaValidator,
        getRestaurantAddress_Handler
    )
    .patch('/:restaurantId/address/update',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        updateRestaurantAddress_SchemaValidator,
        updateRestaurantAddress_Handler
    )
    .post('/:restaurantId/open_hours/get',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        getRestaurantOpenHours_SchemaValidator,
        getRestaurantOpenHours_Handler
    )
    .patch('/:restaurantId/open_hours/update',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        updateRestaurantOpenHours_SchemaValidator,
        updateRestaurantOpenHours_Handler
    )
    .post('/:restaurantId/menu/get',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        getRestaurantMenu_SchemaValidator,
        getRestaurantMenu_Handler
    )
    .patch('/:restaurantId/menu/update',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        updateRestaurantMenu_SchemaValidator,
        updateRestaurantMenu_Handler
    )
    .post('/:restaurantId/payment_methods/get',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        getRestaurantPaymentMethods_SchemaValidator,
        getRestaurantPaymentMethods_Handler
    )
    .patch('/:restaurantId/payment_methods/update',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        updateRestaurantPaymentMethods_SchemaValidator,
        updateRestaurantPaymentMethods_Handler
    )
    .post('/:restaurantId/table_reservation_settings/get',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        getRestaurantTableReservationSettings_SchemaValidator,
        getRestaurantTableReservationSettings_Handler
    )
    .patch('/:restaurantId/table_reservation_settings/update',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        updateRestaurantTableReservationSettings_SchemaValidator,
        updateRestaurantTableReservationSettings_Handler
    )
    .post('/:restaurantId/tax_settings/get',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        getRestaurantTaxSettings_SchemaValidator,
        getRestaurantTaxSettings_Handler
    )
    .patch('/:restaurantId/tax_settings/update',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        updateRestaurantTaxSettings_SchemaValidator,
        updateRestaurantTaxSettings_Handler
    )
    .post('/:restaurantId/scheduled_orders_settings/get',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        getRestaurantScheduledOrdersSettings_SchemaValidator,
        getRestaurantScheduledOrdersSettings_Handler
    )
    .patch('/:restaurantId/scheduled_orders_settings/update',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        updateRestaurantScheduledOrdersSettings_SchemaValidator,
        updateRestaurantScheduledOrdersSettings_Handler
    )
    .post('/:restaurantId/delivery_zones/get',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        getRestaurantDeliveryZones_SchemaValidator,
        getRestaurantDeliveryZones_Handler
    )
    .patch('/:restaurantId/delivery_zones/update',
        createAdminCheckRestaurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        updateRestaurantDeliveryZones_SchemaValidator,
        updateRestaurantDeliveryZones_Handler
    )