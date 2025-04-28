import { Hono } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { createStore_SchemaValidator, createStore_Handler } from "./create.controller";
import { getMyStores_Handler } from "./my_stores.controller";
import { getStore_SchemaValidator, getStore_Handler } from "./get.controller";
import { updateStore_SchemaValidator, updateStore_Handler } from "./update.controller";
import { getStoreAddress_SchemaValidator, getStoreAddress_Handler } from "./address/address_get.controller";
import { updateStoreAddress_SchemaValidator, updateStoreAddress_Handler } from "./address/address_update.controller";
import { getStoreOpenHours_SchemaValidator, getStoreOpenHours_Handler } from "./open_hours/open_hours_get.controller";
import { updateStoreOpenHours_SchemaValidator, updateStoreOpenHours_Handler } from "./open_hours/open_hours_update.controller";
import { getStoreMenu_SchemaValidator, getStoreMenu_Handler } from "./menu/menu_get.controller";
import { updateStoreMenu_SchemaValidator, updateStoreMenu_Handler } from "./menu/menu_update.controller";
import { getStorePaymentMethods_SchemaValidator, getStorePaymentMethods_Handler } from "./payment_methods/payment_methods_get.controller";
import { updateStorePaymentMethods_SchemaValidator, updateStorePaymentMethods_Handler } from "./payment_methods/payment_methods_update.controller";
import { getStoreTaxSettings_SchemaValidator, getStoreTaxSettings_Handler } from "./tax_settings/tax_settings_get.controller";
import { updateStoreTaxSettings_SchemaValidator, updateStoreTaxSettings_Handler } from "./tax_settings/tax_settings_update.controller";
import { getStoreDeliveryZones_SchemaValidator, getStoreDeliveryZones_Handler } from "./delivery_zones/delivery_zones_get.controller";
import { updateStoreDeliveryZones_SchemaValidator, updateStoreDeliveryZones_Handler } from "./delivery_zones/delivery_zones_update.controller";
import { createAdminCheckStore } from "@api-hono/utils/checkStorePermissions";
import { TEAM_PERMISSIONS } from "@lib/consts";
import { getStoreTeamMembers_Handler } from "./team/team.controller";
import { getStoreTeamInvitations_Handler } from "./team/team_invitations.controller";
import { inviteStoreTeamMember_SchemaValidator, inviteStoreTeamMember_Handler } from "./team/team_invite.controller";
import { cancelStoreTeamInvitation_SchemaValidator, cancelStoreTeamInvitation_Handler } from "./team/team_invite_cancel.controller";
import { transferStoreTeamOwnership_SchemaValidator, transferStoreTeamOwnership_Handler } from "./team/team_transfer_ownership.controller";
import { removeStoreTeamMember_SchemaValidator, removeStoreTeamMember_Handler } from "./team/team_remove_member.controller";
import { updateStoreTeamMemberPermissions_SchemaValidator, updateStoreTeamMemberPermissions_Handler } from "./team/team_update_permissions.controller";
import { getStoreServiceFees_Handler, getStoreServiceFees_SchemaValidator } from "./service_fees/service_fees_get.controller";
import { updateStoreServiceFees_Handler, updateStoreServiceFees_SchemaValidator } from "./service_fees/service_fees_update.controller";
import { stripeAccount_Handler } from "./stripe/account.controller";
import { stripeGetAccount_Handler } from "./stripe/get_account.controller";
import { updateStoreStripeSettings_Handler } from "./stripe/stripe_settings_update.controller";
import { updateStoreStripeSettings_SchemaValidator } from "./stripe/stripe_settings_update.controller";
import { startNewCheckout_Handler } from "./stripe_payment_setup/start_new_checkout.controller";
import { verifyCheckout_Handler } from "./stripe_payment_setup/verify_checkout.controller";
import { getDetails_Handler } from "./stripe_payment_setup/get_details";

export const storeRouter = new Hono<HonoVariables>()
    .get(
        '/my_stores',
        getMyStores_Handler
    )
    .post('/create',
        createStore_SchemaValidator,
        createStore_Handler
    )
    .post('/:storeId',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        getStore_SchemaValidator,
        getStore_Handler
    )
    .patch('/:storeId',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        updateStore_SchemaValidator,
        updateStore_Handler
    )
    .get(
        '/:storeId/team',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        getStoreTeamMembers_Handler
    )
    .get(
        '/:storeId/team_invitations',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        getStoreTeamInvitations_Handler
    )
    .post(
        '/:storeId/team_invite',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        inviteStoreTeamMember_SchemaValidator,
        inviteStoreTeamMember_Handler
    )
    .post(
        '/:storeId/team_invite_cancel',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        cancelStoreTeamInvitation_SchemaValidator,
        cancelStoreTeamInvitation_Handler
    )
    .post(
        '/:storeId/team_transfer_ownership',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS
        ]),
        transferStoreTeamOwnership_SchemaValidator,
        transferStoreTeamOwnership_Handler
    )
    .post(
        '/:storeId/team_remove_member',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        removeStoreTeamMember_SchemaValidator,
        removeStoreTeamMember_Handler
    )
    .post(
        '/:storeId/team_update_permissions',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.TEAM_MANAGER
        ]),
        updateStoreTeamMemberPermissions_SchemaValidator,
        updateStoreTeamMemberPermissions_Handler
    )
    .post('/:storeId/address/get',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        getStoreAddress_SchemaValidator,
        getStoreAddress_Handler
    )
    .patch('/:storeId/address/update',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        updateStoreAddress_SchemaValidator,
        updateStoreAddress_Handler
    )
    .post('/:storeId/open_hours/get',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        getStoreOpenHours_SchemaValidator,
        getStoreOpenHours_Handler
    )
    .patch('/:storeId/open_hours/update',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        updateStoreOpenHours_SchemaValidator,
        updateStoreOpenHours_Handler
    )
    .post('/:storeId/menu/get',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        getStoreMenu_SchemaValidator,
        getStoreMenu_Handler
    )
    .patch('/:storeId/menu/update',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        updateStoreMenu_SchemaValidator,
        updateStoreMenu_Handler
    )
    .post('/:storeId/service_fees/get',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        getStoreServiceFees_SchemaValidator,
        getStoreServiceFees_Handler
    )
    .patch('/:storeId/service_fees/update',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        updateStoreServiceFees_SchemaValidator,
        updateStoreServiceFees_Handler
    )
    .get('/:storeId/stripe_payment_setup/start_new_checkout',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        startNewCheckout_Handler
    )
    .get('/:storeId/stripe_payment_setup/verify_checkout',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        verifyCheckout_Handler
    )
    .get('/:storeId/stripe_payment_setup/get_details',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        getDetails_Handler
    )
    .post('/:storeId/payment_methods/get',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        getStorePaymentMethods_SchemaValidator,
        getStorePaymentMethods_Handler
    )
    .patch('/:storeId/payment_methods/update',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        updateStorePaymentMethods_SchemaValidator,
        updateStorePaymentMethods_Handler
    )
    .post('/:storeId/tax_settings/get',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        getStoreTaxSettings_SchemaValidator,
        getStoreTaxSettings_Handler
    )
    .patch('/:storeId/tax_settings/update',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        updateStoreTaxSettings_SchemaValidator,
        updateStoreTaxSettings_Handler
    )
    .post('/:storeId/delivery_zones/get',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        getStoreDeliveryZones_SchemaValidator,
        getStoreDeliveryZones_Handler
    )
    .patch('/:storeId/delivery_zones/update',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        updateStoreDeliveryZones_SchemaValidator,
        updateStoreDeliveryZones_Handler
    )
    .post('/:storeId/stripe/account',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        stripeAccount_Handler
    )
    .get('/:storeId/stripe/get_account',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        stripeGetAccount_Handler
    )
    .patch('/:storeId/stripe/settings',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        updateStoreStripeSettings_SchemaValidator,
        updateStoreStripeSettings_Handler
    )