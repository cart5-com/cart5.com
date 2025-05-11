import type { OrderType } from '@lib/types/orderType';
import { KNOWN_ERROR } from '../types/errors';
import { generateCartId } from "./generateCartId";
import type { TaxSettings } from "@lib/zod/taxSchema";
import { isStoreOpenNow } from '@lib/utils/isOpenNow';
import { listAvailablePaymentMethods } from '@lib/utils/listAvailablePaymentMethods';
import type { calculateSubTotal } from './calculateSubTotal';
import type { calculateCartTotalPrice } from './calculateCartItemPrice';

type storeDataType = Awaited<ReturnType<typeof import("@db/services/store.service").getStoreData_Service>>;
type userDataType = Awaited<ReturnType<typeof import("@db/services/user_data.service").getUserData_Service>>;

export const checkUserDataBeforePlacingOrder = (
    userData: userDataType,
    host: string,
    storeId: string,
) => {
    if (!userData) {
        throw new KNOWN_ERROR("User data not found", "USER_DATA_NOT_FOUND");
    }
    if (!userData.rememberLastPaymentMethodId) {
        throw new KNOWN_ERROR("Payment method not selected", "PAYMENT_METHOD_NOT_SELECTED");
    }
    if (!userData.rememberLastOrderType) {
        throw new KNOWN_ERROR("Order type not found", "ORDER_TYPE_NOT_FOUND");
    }
    const currentCart = userData.carts?.[generateCartId(host ?? '', storeId)];
    if (!currentCart) {
        throw new KNOWN_ERROR("Cart not found", "CART_NOT_FOUND");
    }
    if (!currentCart.items) {
        throw new KNOWN_ERROR("Cart is empty", "CART_EMPTY");
    }
    const currentOrderType = userData.rememberLastOrderType;
    if (currentOrderType !== 'delivery' && currentOrderType !== 'pickup') {
        throw new KNOWN_ERROR("Invalid order type", "INVALID_ORDER_TYPE");
    }
    const deliveryAddress = currentOrderType === 'delivery' && userData.rememberLastAddressId && userData.addresses ?
        userData.addresses[userData.rememberLastAddressId] : undefined;
    if (currentOrderType === 'delivery' && !deliveryAddress) {
        throw new KNOWN_ERROR("Delivery address not found", "DELIVERY_ADDRESS_NOT_FOUND");
    }
    if (currentOrderType === 'delivery' && !deliveryAddress?.address1) {
        throw new KNOWN_ERROR("Delivery address1 is required", "DELIVERY_ADDRESS1_REQUIRED");
    }
    if (currentOrderType === 'delivery' && !deliveryAddress?.country) {
        throw new KNOWN_ERROR("Delivery address country is required", "DELIVERY_ADDRESS_COUNTRY_REQUIRED");
    }
    if (currentOrderType === 'delivery' && !deliveryAddress?.lat && !deliveryAddress?.lng) {
        throw new KNOWN_ERROR("Delivery address coordinates are required", "DELIVERY_ADDRESS_COORDINATES_REQUIRED");
    }
    return {
        currentCart,
        currentOrderType,
        deliveryAddress,
    };
}

export const checkStoreDataBeforePlacingOrder = (
    storeData: storeDataType,
    currentOrderType: OrderType,
    userData: userDataType,
) => {
    if (!storeData) {
        throw new KNOWN_ERROR("Store data not found", "STORE_DATA_NOT_FOUND");
    }
    if (
        userData?.rememberLastOrderType === 'pickup' && !storeData.offersPickup
    ) {
        throw new KNOWN_ERROR("Store does not offer pickup", "STORE_DOES_NOT_OFFER_PICKUP");
    }
    if (
        userData?.rememberLastOrderType === 'delivery' && !storeData.offersDelivery
    ) {
        throw new KNOWN_ERROR("Store does not offer delivery", "STORE_DOES_NOT_OFFER_DELIVERY");
    }
    const isStoreOpen = isStoreOpenNow(currentOrderType, storeData?.openHours ?? null);
    if (
        !isStoreOpen
        // What about scheduled orders? we do not have scheduled orders yet. maybe later
    ) {
        throw new KNOWN_ERROR("Store is not open", "STORE_IS_NOT_OPEN");
    }
    const taxSettings = storeData?.taxSettings as TaxSettings;
    if (!taxSettings) {
        throw new KNOWN_ERROR("Tax settings not found", "TAX_SETTINGS_NOT_FOUND");
    }
    const menuRoot = storeData?.menu?.menuRoot;
    if (!menuRoot) {
        throw new KNOWN_ERROR("Menu root not found", "MENU_ROOT_NOT_FOUND");
    }

    const availablePaymentMethods = listAvailablePaymentMethods(storeData, currentOrderType);
    if (!availablePaymentMethods || availablePaymentMethods.length === 0) {
        throw new KNOWN_ERROR("Payment methods not configured for store", "PAYMENT_METHODS_NOT_CONFIGURED");
    }
    const currentPaymentMethod = availablePaymentMethods.find(method => method.id === userData?.rememberLastPaymentMethodId);
    if (!currentPaymentMethod) {
        throw new KNOWN_ERROR("Invalid payment method", "INVALID_PAYMENT_METHOD");
    }
    return {
        menuRoot,
        taxSettings,
        currentPaymentMethod,
        storeTimezone: storeData.openHours?.timezone,
    };
}

export const checkMinimumOrderValueForDelivery = (
    subTotalWithDeliveryAndServiceFees: ReturnType<typeof calculateSubTotal>,
    taxSettings: TaxSettings,
    currentOrderType: OrderType,
    cartTotals: ReturnType<typeof calculateCartTotalPrice>,
) => {
    if (currentOrderType === 'delivery') {
        if (!subTotalWithDeliveryAndServiceFees.bestDeliveryZone) {
            throw new KNOWN_ERROR("Out of delivery zone", "OUT_OF_DELIVERY_ZONE");
        }
        if (cartTotals.shownFee < (subTotalWithDeliveryAndServiceFees.bestDeliveryZone?.minCart || 0)) {
            const errorMessage = `Minimum Subtotal:
                            ${taxSettings.currencySymbol}${subTotalWithDeliveryAndServiceFees.bestDeliveryZone?.minCart}
                            Please add more items to your cart.`
            throw new KNOWN_ERROR(errorMessage, "CART_SUBTOTAL_LESS_THAN_MINIMUM_CART_VALUE");
        }
    }
}